import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import type { Molecule, Protein } from '../types';
import type { ViralProtein } from '../data/viruses';
import { getPDB } from '../services/pdbService';
import { getBindingSite } from '../data/bindingSites';

interface MolecularViewerProps {
  molecule: Molecule;
  protein: Protein;
  viralProtein?: ViralProtein;
  bindingSiteId?: string;
}

export function MolecularViewer({
  molecule,
  protein,
  viralProtein,
  bindingSiteId,
}: MolecularViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [loading, setLoading] = useState(!!viralProtein);

  useEffect(() => {
    if (!viralProtein || !bindingSiteId) {
      // Fallback: simple 2D visualization
      return;
    }

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
        camera.position.z = 80;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const light1 = new THREE.DirectionalLight(0x00ff00, 1);
        light1.position.set(50, 50, 50);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x00aa00, 0.6);
        light2.position.set(-50, -50, 50);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0x003300, 0.5);
        scene.add(ambientLight);

        // Load protein structure
        const pdbStructure = await getPDB(viralProtein.pdbId);
        const proteinGroup = new THREE.Group();

        if (pdbStructure.loaded && pdbStructure.atoms.length > 0) {
          // Calculate center and scale
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

          const scale = maxDist > 0 ? 60 / maxDist : 1;

          // Render protein atoms
          const atomGeometry = new THREE.SphereGeometry(1.5, 12, 12);
          const sampledAtoms = pdbStructure.atoms.length > 5000
            ? pdbStructure.atoms.filter((_, i) => i % 3 === 0)
            : pdbStructure.atoms.length > 2000
            ? pdbStructure.atoms.filter((_, i) => i % 2 === 0)
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
              opacity: 0.7,
              transparent: true
            });

            const sphere = new THREE.Mesh(atomGeometry, material);
            sphere.position.set(
              (atom.x - centerX) * scale,
              (atom.y - centerY) * scale,
              (atom.z - centerZ) * scale
            );
            sphere.scale.setScalar(0.8 + (atom.bFactor / 100) * 0.4);
            proteinGroup.add(sphere);
          }

          // Get binding site info
          const bindingSite = getBindingSite(viralProtein.pdbId, bindingSiteId);

          // Draw binding site box
          if (bindingSite) {
            const boxGeometry = new THREE.BoxGeometry(
              bindingSite.sizeX,
              bindingSite.sizeY,
              bindingSite.sizeZ
            );
            const boxMaterial = new THREE.MeshBasicMaterial({
              color: 0xff00ff,
              wireframe: true,
              transparent: true,
              opacity: 0.5
            }) as any;

            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(
              bindingSite.centerX * scale,
              bindingSite.centerY * scale,
              bindingSite.centerZ * scale
            );
            proteinGroup.add(box);
          }

          // Create ligand at binding site center
          const ligandGroup = new THREE.Group();
          if (bindingSite) {
            const ligandGeometry = new THREE.SphereGeometry(0.8, 8, 8);
            const ligandMaterial = new THREE.MeshPhongMaterial({
              color: 0xff6600,
              emissive: 0xff3300,
              shininess: 100,
              opacity: 0.95,
              transparent: true
            });

            // Create ligand atoms cluster
            const ligandAtomCount = 7;
            for (let i = 0; i < ligandAtomCount; i++) {
              const sphere = new THREE.Mesh(ligandGeometry, ligandMaterial);
              const angle = (i / ligandAtomCount) * Math.PI * 2;
              const radius = 3;

              sphere.position.set(
                bindingSite.centerX * scale + Math.cos(angle) * radius,
                bindingSite.centerY * scale + Math.sin(angle) * radius,
                bindingSite.centerZ * scale + Math.cos(angle * 0.5) * 2
              );
              ligandGroup.add(sphere);
            }

            // Draw interaction lines from protein to ligand center
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions: number[] = [];

            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const proteinPos = [
                bindingSite.centerX * scale + Math.cos(angle) * 15,
                bindingSite.centerY * scale + Math.sin(angle) * 15,
                bindingSite.centerZ * scale + Math.cos(angle * 0.7) * 10
              ];
              const ligandPos = [
                bindingSite.centerX * scale,
                bindingSite.centerY * scale,
                bindingSite.centerZ * scale
              ];

              linePositions.push(...proteinPos, ...ligandPos);
            }

            lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0xff00ff,
              opacity: 0.6,
              transparent: true
            });
            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            ligandGroup.add(lines);
          }

          proteinGroup.add(ligandGroup);
        }

        scene.add(proteinGroup);
        setLoading(false);

        // Animation loop
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          proteinGroup.rotation.x += 0.002;
          proteinGroup.rotation.y += 0.004;

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
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
        console.error('[MOLECULAR VIEWER] Error:', err);
        setLoading(false);
      }
    };

    initScene();
  }, [viralProtein, bindingSiteId]);

  // Simple 2D fallback
  if (!viralProtein || !bindingSiteId) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f0',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          textAlign: 'center'
        }}
      >
        {protein.name} + {molecule.name}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0f0',
        fontFamily: '"Courier New", monospace'
      }}
    >
      {loading && (
        <div style={{ fontSize: '14px' }}>
          Cargando complejo...
        </div>
      )}
    </div>
  );
}
