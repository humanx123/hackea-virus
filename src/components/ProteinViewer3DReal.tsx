import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ViralProtein } from '../data/viruses';
import { getPDB } from '../services/pdbService';

interface ProteinViewer3DRealProps {
  protein: ViralProtein;
  isSelected: boolean;
}

export function ProteinViewer3DReal({ protein, isSelected }: ProteinViewer3DRealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const proteinRef = useRef<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initScene = async () => {
      if (!containerRef.current) return;

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

      // Load PDB
      try {
        const pdbStructure = await getPDB(protein.pdbId);

        if (!pdbStructure.loaded) {
          setError(`⚠️ Error: No se pudo descargar PDB ${protein.pdbId} de RCSB. Mostrando estructura esquemática.`);
          setLoading(false);

          // Mostrar estructura esquemática igual
          const proteinGroup = new THREE.Group();
          proteinRef.current = proteinGroup;

          // Crear estructura placeholder con más detalles
          const atomGeometry = new THREE.SphereGeometry(2, 16, 16);
          for (let i = 0; i < 40; i++) {
            const colors = [0x00ff00, 0x0099ff, 0xff3333, 0xffff00];
            const color = colors[i % colors.length];
            const material = new THREE.MeshPhongMaterial({
              color,
              emissive: isSelected ? color : new THREE.Color(0x003300),
              shininess: 100
            });
            const sphere = new THREE.Mesh(atomGeometry, material);

            const angle = (i / 40) * Math.PI * 2;
            const radius = 40 + (i % 4) * 15;
            sphere.position.set(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius + (i % 3) * 10,
              Math.cos(angle * 0.7) * 20
            );
            sphere.scale.setScalar(0.8 + Math.random() * 0.4);
            proteinGroup.add(sphere);
          }

          scene.add(proteinGroup);
          return;
        }

        if (pdbStructure.atoms.length === 0) {
          setError(`⚠️ PDB ${protein.pdbId} descargado pero sin átomos válidos. Mostrando estructura esquemática.`);
          setLoading(false);
          return;
        }

        console.log(`✓ PDB cargado: ${pdbStructure.atoms.length} átomos`);

        // Create protein visualization
        const proteinGroup = new THREE.Group();
        proteinRef.current = proteinGroup;

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

        // Create atoms as spheres
        const atomGeometry = new THREE.SphereGeometry(1.5, 12, 12);

        // Sample atoms for performance (show more atoms now)
        const sampledAtoms = pdbStructure.atoms.length > 5000
          ? pdbStructure.atoms.filter((_, i) => i % 3 === 0)
          : pdbStructure.atoms.length > 2000
          ? pdbStructure.atoms.filter((_, i) => i % 2 === 0)
          : pdbStructure.atoms;

        console.log(`Renderizando ${sampledAtoms.length} átomos (total: ${pdbStructure.atoms.length})`);

        for (const atom of sampledAtoms) {
          let color = 0x00ff00; // Default green

          // Color by element
          if (atom.element === 'C') color = 0x00ff00; // Green for carbon
          else if (atom.element === 'N') color = 0x0099ff; // Blue for nitrogen
          else if (atom.element === 'O') color = 0xff3333; // Red for oxygen
          else if (atom.element === 'S') color = 0xffff00; // Yellow for sulfur

          const material = new THREE.MeshPhongMaterial({
            color,
            emissive: isSelected ? color : new THREE.Color(0x003300),
            shininess: 100
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

        // Add wireframe edge
        const edgeGeometry = new THREE.IcosahedronGeometry(60, 2);
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: isSelected ? 0x00ff00 : 0x003300,
          linewidth: 1,
          opacity: 0.2
        });
        const wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        proteinGroup.add(wireframe);

        scene.add(proteinGroup);
        setLoading(false);
      } catch (err) {
        setError('Error cargando estructura PDB');
        setLoading(false);
      }

      // Animation loop
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        if (proteinRef.current) {
          proteinRef.current.rotation.x += 0.003;
          proteinRef.current.rotation.y += 0.005;
          proteinRef.current.rotation.z += 0.002;
        }

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
    };

    initScene();
  }, [protein.pdbId, isSelected]);

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
          Cargando PDB {protein.pdbId}...
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
