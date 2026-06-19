import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ViralProtein } from '../data/viruses';
import type { Molecule } from '../types';
import { getPDB } from '../services/pdbService';
import { getLigand } from '../data/ligands';

interface MolecularDockingViewerProps {
  protein: ViralProtein;
  molecule: Molecule;
  affinity: number;
}

export function MolecularDockingViewer({ protein, molecule, affinity }: MolecularDockingViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initScene = async () => {
      if (!containerRef.current) return;

      try {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x001a00);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 100;
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const light1 = new THREE.DirectionalLight(0x00ff00, 1);
        light1.position.set(50, 50, 50);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x00aa00, 0.6);
        light2.position.set(-50, -50, 50);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0x003300, 0.5);
        scene.add(ambientLight);

        // Load protein
        const pdbStructure = await getPDB(protein.pdbId);

        // Create protein visualization (real or schematic)
        const proteinGroup = new THREE.Group();

        if (pdbStructure.loaded && pdbStructure.atoms.length > 0) {
          console.log(`[DOCKING] Renderizando proteína real: ${pdbStructure.atomCount} átomos`);

          // Calculate center and scale for protein
          const positions = pdbStructure.atoms.map(a => [a.x, a.y, a.z]);
          const centerX = positions.reduce((sum, p) => sum + p[0], 0) / positions.length;
          const centerY = positions.reduce((sum, p) => sum + p[1], 0) / positions.length;
          const centerZ = positions.reduce((sum, p) => sum + p[2], 0) / positions.length;

          const maxDist = Math.max(
            ...positions.map(p => {
              const dx = p[0] - centerX;
              const dy = p[1] - centerY;
              const dz = p[2] - centerZ;
              return Math.sqrt(dx * dx + dy * dy + dz * dz);
            })
          );

          const scale = maxDist > 0 ? 50 / maxDist : 1;

          // Create atoms as spheres
          const atomGeometry = new THREE.SphereGeometry(1.2, 8, 8);
          const sampledAtoms = pdbStructure.atoms.length > 2000
            ? pdbStructure.atoms.filter((_, i) => i % 3 === 0)
            : pdbStructure.atoms;

          for (const atom of sampledAtoms) {
            let color = 0x00ff00;
            if (atom.element === 'C') color = 0x00ff00;
            else if (atom.element === 'N') color = 0x0099ff;
            else if (atom.element === 'O') color = 0xff3333;
            else if (atom.element === 'S') color = 0xffff00;

            const material = new THREE.MeshPhongMaterial({
              color,
              emissive: new THREE.Color(0x003300),
              shininess: 100,
              opacity: 0.8,
              transparent: true
            });

            const sphere = new THREE.Mesh(atomGeometry, material);
            sphere.position.set(
              (atom.x - centerX) * scale - 30,
              (atom.y - centerY) * scale,
              (atom.z - centerZ) * scale
            );
            sphere.scale.setScalar(0.7 + (atom.bFactor / 100) * 0.3);
            proteinGroup.add(sphere);
          }
        } else {
          console.warn(`[DOCKING] Usando estructura esquemática para ${protein.pdbId}`);
          setError(`⚠️ Estructura esquemática (PDB ${protein.pdbId} no disponible)`);

          // Crear estructura esquemática
          const atomGeometry = new THREE.SphereGeometry(1.5, 8, 8);
          for (let i = 0; i < 30; i++) {
            const colors = [0x00ff00, 0x0099ff, 0xff3333, 0xffff00];
            const color = colors[i % colors.length];
            const material = new THREE.MeshPhongMaterial({
              color,
              emissive: color,
              shininess: 100,
              opacity: 0.9,
              transparent: true
            });
            const sphere = new THREE.Mesh(atomGeometry, material);
            const angle = (i / 30) * Math.PI * 2;
            const radius = 35 + (i % 3) * 10;
            sphere.position.set(
              Math.cos(angle) * radius - 30,
              Math.sin(angle) * radius,
              Math.cos(angle * 0.7) * 15
            );
            sphere.scale.setScalar(0.7 + Math.random() * 0.3);
            proteinGroup.add(sphere);
          }
        }

        scene.add(proteinGroup);

        // Create ligand visualization (simple model)
        const ligand = getLigand(molecule.id);
        const ligandGroup = new THREE.Group();

        if (ligand) {
          // Create ligand as a cluster of smaller spheres
          const ligandGeometry = new THREE.SphereGeometry(0.8, 6, 6);
          const ligandMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6600,
            emissive: 0xff3300,
            shininess: 100,
            opacity: 0.9,
            transparent: true
          });

          // Create 5-7 atoms representing ligand
          const ligandAtomCount = 5 + Math.random() * 3;
          for (let i = 0; i < ligandAtomCount; i++) {
            const sphere = new THREE.Mesh(ligandGeometry, ligandMaterial);
            const angle = (i / ligandAtomCount) * Math.PI * 2;
            const radius = 4;

            sphere.position.set(
              Math.cos(angle) * radius + 30,
              Math.sin(angle) * radius,
              Math.cos(angle * 0.5) * 2
            );
            ligandGroup.add(sphere);
          }

          // Add label
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ff6600';
            ctx.font = 'bold 32px monospace';
            ctx.fillText(molecule.name, 20, 45);
          }
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.position.set(30, 12, 0);
          sprite.scale.set(10, 2.5, 1);
          ligandGroup.add(sprite);
        }

        scene.add(ligandGroup);

        // Draw interaction lines (based on affinity)
        if (ligand && Math.abs(affinity) > 6) {
          const lineGeometry = new THREE.BufferGeometry();
          const linePositions: number[] = [];

          // Create several interaction lines between protein and ligand
          for (let i = 0; i < 5; i++) {
            const proteinPos = [
              -30 + Math.random() * 20,
              Math.random() * 20,
              Math.random() * 10
            ];
            const ligandPos = [
              30 + Math.random() * 10,
              Math.random() * 10,
              Math.random() * 5
            ];

            linePositions.push(...proteinPos, ...ligandPos);
          }

          lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
          const lineMaterial = new THREE.LineBasicMaterial({
            color: Math.abs(affinity) > 8 ? 0x00ff00 : 0xffff00,
            linewidth: 2,
            opacity: 0.6,
            transparent: true
          });
          const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
          scene.add(lines);
        }

        setLoading(false);

        // Animation loop
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          proteinGroup.rotation.y += 0.003;
          ligandGroup.rotation.y += 0.01;
          ligandGroup.rotation.z += 0.005;

          renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', handleResize);
          containerRef.current?.removeChild(renderer.domElement);
          renderer.dispose();
        };
      } catch (err) {
        console.error('[DOCKING] Error:', err);
        setError('Error cargando visualización de docking');
        setLoading(false);
      }
    };

    initScene();
  }, [protein.pdbId, molecule.id, affinity]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#001a00',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {loading && (
        <div style={{ color: '#0f0', fontSize: '28px', fontFamily: '"Courier New", monospace' }}>
          Visualizando unión molecular...
        </div>
      )}
      {error && (
        <div style={{ color: '#f33', fontSize: '24px', fontFamily: '"Courier New", monospace', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
