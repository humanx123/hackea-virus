import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ViralProtein } from '../data/viruses';

interface ProteinViewer3DProps {
  protein: ViralProtein;
  isSelected: boolean;
}

export function ProteinViewer3D({ isSelected }: ProteinViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const proteinRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
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
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const light1 = new THREE.DirectionalLight(0x00ff00, 0.8);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x00aa00, 0.4);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x003300, 0.3);
    scene.add(ambientLight);

    // Create protein visualization
    const proteinGroup = new THREE.Group();
    proteinRef.current = proteinGroup;

    // Simulate protein structure with multiple spheres
    const particleCount = 15 + Math.random() * 10;
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: isSelected ? 0x00ff00 : 0x00aa00,
        emissive: isSelected ? 0x00ff00 : 0x005500,
        shininess: 100
      });
      const sphere = new THREE.Mesh(geometry, material);

      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + (i % 3) * 0.5;
      sphere.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius + (i % 2) * 0.5,
        Math.cos(angle * 0.5) * 0.8
      );

      proteinGroup.add(sphere);
    }

    // Add wireframe representation
    const wireGeometry = new THREE.IcosahedronGeometry(2, 4);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: isSelected ? 0x00ff00 : 0x003300,
      linewidth: 1,
      opacity: 0.3
    });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    proteinGroup.add(wireframe);

    scene.add(proteinGroup);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (proteinGroup) {
        proteinGroup.rotation.x += 0.005;
        proteinGroup.rotation.y += 0.01;
        proteinGroup.rotation.z += 0.003;
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
  }, [isSelected]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#001a00',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    />
  );
}
