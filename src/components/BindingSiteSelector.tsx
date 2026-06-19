import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ViralProtein } from '../data/viruses';
import type { Molecule } from '../types';
import { getPDB } from '../services/pdbService';
import { getBindingSitesForProtein, type BindingSite } from '../data/bindingSites';
import { displaySizes } from '../styles/sizes';
import { findNearbyHotspots, type ProteinHotspot } from '../data/proteinHotspots';

interface BindingSiteSelectorProps {
  protein: ViralProtein;
  molecule: Molecule;
  onSelect: (siteId: string) => void;
  onCancel: () => void;
  gamepadInput: any;
  keyboardInput: any;
}

export function BindingSiteSelector({
  protein,
  molecule,
  onSelect,
  onCancel,
  gamepadInput,
  keyboardInput
}: BindingSiteSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bindingSites, setBindingSites] = useState<BindingSite[]>([]);

  // Live UI state (throttled from the animation loop)
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [liveCoords, setLiveCoords] = useState({ x: 0, y: 0, z: 0 });
  const [detectedHotspots, setDetectedHotspots] = useState<ProteinHotspot[]>([]);

  // Refs read inside the animation loop (always latest)
  const inputRef = useRef({ gamepad: gamepadInput, keyboard: keyboardInput });
  inputRef.current = { gamepad: gamepadInput, keyboard: keyboardInput };

  const sitesRef = useRef<BindingSite[]>([]);
  const boxPosRef = useRef({ x: 0, y: 0, z: 0 }); // box center in authored Å coords
  const clampRef = useRef(80);
  const scaleRef = useRef(1);
  const prevButtonsRef = useRef({ up: false, down: false, a: false, b: false, x: false });
  // Require A/B to be released once before they fire (avoids cascade on mount).
  const armedRef = useRef({ a: false, b: false });

  // Callbacks via ref so the loop always has the latest without re-init
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    let animationId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let disposed = false;

    const initScene = async () => {
      if (!containerRef.current) return;

      try {
        const sites = getBindingSitesForProtein(protein.pdbId);
        sitesRef.current = sites;
        setBindingSites(sites);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x001a00);

        const camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          2000
        );
        camera.position.z = 130;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
        scene.add(new THREE.AmbientLight(0x003300, 0.6));

        // protein group (rotated by the right stick)
        const proteinGroup = new THREE.Group();
        scene.add(proteinGroup);

        const pdbStructure = await getPDB(protein.pdbId);

        if (pdbStructure.loaded && pdbStructure.atoms.length > 0) {
          const positions = pdbStructure.atoms.map(a => [a.x, a.y, a.z]);
          const cX = positions.reduce((s, p) => s + p[0], 0) / positions.length;
          const cY = positions.reduce((s, p) => s + p[1], 0) / positions.length;
          const cZ = positions.reduce((s, p) => s + p[2], 0) / positions.length;

          const maxDist = Math.max(
            ...positions.map(p => {
              const dx = p[0] - cX, dy = p[1] - cY, dz = p[2] - cZ;
              return Math.sqrt(dx * dx + dy * dy + dz * dz);
            })
          );

          const scale = maxDist > 0 ? 60 / maxDist : 1;
          scaleRef.current = scale;
          clampRef.current = (maxDist || 60) * 1.15; // Å range for the cursor box

          clampRef.current = Math.max((maxDist || 60) * 0.75, 36);

          const atomGeometry = new THREE.SphereGeometry(1.5, 10, 10);
          const sampledAtoms = pdbStructure.atoms.length > 5000
            ? pdbStructure.atoms.filter((_, i) => i % 3 === 0)
            : pdbStructure.atoms.length > 2000
            ? pdbStructure.atoms.filter((_, i) => i % 2 === 0)
            : pdbStructure.atoms;

          for (const atom of sampledAtoms) {
            let color = 0x00ff00;
            if (atom.element === 'N') color = 0x0099ff;
            else if (atom.element === 'O') color = 0xff3333;
            else if (atom.element === 'S') color = 0xffff00;

            const material = new THREE.MeshPhongMaterial({
              color,
              emissive: new THREE.Color(0x002200),
              shininess: 80,
              opacity: 0.5,
              transparent: true
            });
            const sphere = new THREE.Mesh(atomGeometry, material);
            sphere.position.set(
              (atom.x - cX) * scale,
              (atom.y - cY) * scale,
              (atom.z - cZ) * scale
            );
            sphere.scale.setScalar(0.8 + (atom.bFactor / 100) * 0.4);
            proteinGroup.add(sphere);
          }

          // NOTE: authored site/hotspot coords are placed with the same
          // convention as the centered atoms via this offset.
          const offset = { x: cX, y: cY, z: cZ };

          if (sites.length > 0) {
            const initialIndex = sites.reduce((bestIndex, site, index) => {
              const best = sites[bestIndex];
              const bestDx = best.centerX - cX;
              const bestDy = best.centerY - cY;
              const bestDz = best.centerZ - cZ;
              const siteDx = site.centerX - cX;
              const siteDy = site.centerY - cY;
              const siteDz = site.centerZ - cZ;
              const bestDist = bestDx * bestDx + bestDy * bestDy + bestDz * bestDz;
              const siteDist = siteDx * siteDx + siteDy * siteDy + siteDz * siteDz;
              return siteDist < bestDist ? index : bestIndex;
            }, 0);

            boxPosRef.current = {
              x: sites[initialIndex].centerX,
              y: sites[initialIndex].centerY,
              z: sites[initialIndex].centerZ
            };
            setActiveSiteIndex(initialIndex);
            setLiveCoords({ ...boxPosRef.current });
          }

          // Static dim boxes for each predefined site (targets)
          sites.forEach(site => {
            const geo = new THREE.BoxGeometry(site.sizeX, site.sizeY, site.sizeZ);
            const edges = new THREE.EdgesGeometry(geo);
            const mat = new THREE.LineBasicMaterial({ color: 0x0066aa, transparent: true, opacity: 0.5 });
            const box = new THREE.LineSegments(edges, mat);
            box.position.set(
              (site.centerX - offset.x) * scale,
              (site.centerY - offset.y) * scale,
              (site.centerZ - offset.z) * scale
            );
            proteinGroup.add(box);
          });

          // The movable CURSOR box (bright magenta, thicker presence)
          const cursorSize = 22;
          const cursorGeo = new THREE.BoxGeometry(cursorSize, cursorSize, cursorSize);
          const cursorEdges = new THREE.EdgesGeometry(cursorGeo);
          const cursorMat = new THREE.LineBasicMaterial({ color: 0xff00ff });
          const cursorBox = new THREE.LineSegments(cursorEdges, cursorMat);
          // a translucent fill so it reads as a volume
          const fillMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.08 });
          const cursorFill = new THREE.Mesh(cursorGeo, fillMat);
          const cursorGroup = new THREE.Group();
          cursorGroup.add(cursorBox);
          cursorGroup.add(cursorFill);
          proteinGroup.add(cursorGroup);

          // small marker at the exact center
          const markerGeo = new THREE.SphereGeometry(2.5, 12, 12);
          const markerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          cursorGroup.add(marker);

          let lastUiUpdate = 0;
          let pulse = 0;

          const animate = (t: number) => {
            if (disposed) return;
            animationId = requestAnimationFrame(animate);

            const gp = inputRef.current.gamepad || {};
            const kb = inputRef.current.keyboard || {};

            // ---- Right stick rotates the protein ----
            const rsx = gp.rightStickX || 0;
            const rsy = gp.rightStickY || 0;
            proteinGroup.rotation.y += rsx * 0.045;
            proteinGroup.rotation.x += rsy * 0.045;

            // ---- Move the cursor box (screen-relative) ----
            // Left stick X/Y, plus keyboard arrows as fallback.
            let mx = gp.leftStickX || 0;
            let my = gp.leftStickY || 0;
            if (kb.dpadLeft) mx -= 1;
            if (kb.dpadRight) mx += 1;
            // arrows up/down on keyboard are reserved for site cycling, so
            // keyboard vertical box movement is not bound (gamepad covers it)

            // Depth via bumpers / triggers
            let mz = 0;
            if (gp.rbPressed || (gp.rtValue || 0) > 0.4) mz += 1;
            if (gp.lbPressed || (gp.ltValue || 0) > 0.4) mz -= 1;

            const speed = 0.9; // scene units per frame at full tilt
            if (mx !== 0 || my !== 0 || mz !== 0) {
              // screen-space delta (y inverted so up = +Y on screen)
              const worldDelta = new THREE.Vector3(mx * speed, -my * speed, mz * speed);
              // convert to protein-local space (group only rotates)
              const localDelta = worldDelta.clone().applyQuaternion(
                proteinGroup.quaternion.clone().invert()
              );
              const s = scaleRef.current || 1;
              const clamp = clampRef.current;
              const next = {
                x: boxPosRef.current.x + localDelta.x / s,
                y: boxPosRef.current.y + localDelta.y / s,
                z: boxPosRef.current.z + localDelta.z / s
              };
              // clamp around protein centroid (offset)
              next.x = Math.max(offset.x - clamp, Math.min(offset.x + clamp, next.x));
              next.y = Math.max(offset.y - clamp, Math.min(offset.y + clamp, next.y));
              next.z = Math.max(offset.z - clamp, Math.min(offset.z + clamp, next.z));
              boxPosRef.current = next;
            }

            // ---- D-pad up/down: snap to predefined sites ----
            const up = !!gp.dpadUp || !!kb.dpadUp;
            const down = !!gp.dpadDown || !!kb.dpadDown;
            const cycleX = !!kb.xPressed; // keyboard 'x' also cycles
            if ((up && !prevButtonsRef.current.up) || (cycleX && !prevButtonsRef.current.x)) {
              const cur = nearestSiteIndex();
              const ni = (cur - 1 + sites.length) % sites.length;
              snapToSite(ni);
            }
            if (down && !prevButtonsRef.current.down) {
              const cur = nearestSiteIndex();
              const ni = (cur + 1) % sites.length;
              snapToSite(ni);
            }
            prevButtonsRef.current.up = up;
            prevButtonsRef.current.down = down;
            prevButtonsRef.current.x = cycleX;

            // ---- A select / B cancel (armed edge) ----
            const a = !!gp.aPressed || !!kb.aPressed;
            const b = !!gp.bPressed || !!kb.bPressed;
            if (!a) armedRef.current.a = true;
            if (!b) armedRef.current.b = true;
            if (a && armedRef.current.a && !prevButtonsRef.current.a) {
              armedRef.current.a = false;
              const idx = nearestSiteIndex();
              if (sites[idx]) onSelectRef.current(sites[idx].id);
            }
            if (b && armedRef.current.b && !prevButtonsRef.current.b) {
              armedRef.current.b = false;
              onCancelRef.current();
            }
            prevButtonsRef.current.a = a;
            prevButtonsRef.current.b = b;

            // ---- Position the cursor box ----
            const s = scaleRef.current || 1;
            cursorGroup.position.set(
              (boxPosRef.current.x - offset.x) * s,
              (boxPosRef.current.y - offset.y) * s,
              (boxPosRef.current.z - offset.z) * s
            );
            pulse += 0.08;
            const p = 1 + Math.sin(pulse) * 0.06;
            cursorBox.scale.setScalar(p);

            // ---- Throttled UI update (hotspots + coords + nearest) ----
            if (t - lastUiUpdate > 120) {
              lastUiUpdate = t;
              const bp = boxPosRef.current;
              setLiveCoords({ x: bp.x, y: bp.y, z: bp.z });
              setActiveSiteIndex(nearestSiteIndex());
              const nearby = findNearbyHotspots(protein.pdbId, bp.x, bp.y, bp.z, 9);
              setDetectedHotspots(prev => {
                const prevIds = prev.map(h => h.id).join(',');
                const nextIds = nearby.map(h => h.id).join(',');
                return prevIds === nextIds ? prev : nearby;
              });
            }

            renderer!.render(scene, camera);
          };

          // helpers (closures over sites/boxPosRef)
          function nearestSiteIndex(): number {
            const bp = boxPosRef.current;
            let best = 0;
            let bestD = Infinity;
            sites.forEach((st, i) => {
              const dx = st.centerX - bp.x;
              const dy = st.centerY - bp.y;
              const dz = st.centerZ - bp.z;
              const d = dx * dx + dy * dy + dz * dz;
              if (d < bestD) { bestD = d; best = i; }
            });
            return best;
          }
          function snapToSite(i: number) {
            const st = sites[i];
            if (!st) return;
            boxPosRef.current = { x: st.centerX, y: st.centerY, z: st.centerZ };
          }

          setLoading(false);
          animationId = requestAnimationFrame(animate);
        } else {
          setError(`No se pudo cargar la estructura PDB ${protein.pdbId}`);
          setLoading(false);
        }

        const handleResize = () => {
          if (!containerRef.current || !renderer) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // store cleanup for resize
        cleanupResize = () => window.removeEventListener('resize', handleResize);
      } catch (err) {
        console.error('[BINDING SITE] Error:', err);
        setError('Error cargando sitios de unión');
        setLoading(false);
      }
    };

    let cleanupResize = () => {};
    initScene();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      cleanupResize();
      if (renderer) {
        const el = renderer.domElement;
        el.parentElement?.removeChild(el);
        renderer.dispose();
      }
    };
  }, [protein.pdbId]);

  const activeSite = bindingSites[activeSiteIndex];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* 3D Viewer */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          backgroundColor: '#001a00',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {loading && (
          <div style={{ color: '#0f0', fontSize: displaySizes.largeText, fontFamily: '"Courier New", monospace' }}>
            Cargando estructura {protein.pdbId}...
          </div>
        )}
        {error && (
          <div style={{ color: '#f33', fontSize: displaySizes.normalText, fontFamily: '"Courier New", monospace', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div
        style={{
          width: '520px',
          backgroundColor: 'rgba(0, 20, 0, 0.97)',
          borderLeft: '3px solid #0f0',
          padding: displaySizes.hugePadding,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: displaySizes.largePadding,
          color: '#0f0',
          fontFamily: '"Courier New", monospace'
        }}
      >
        <div>
          <h2 style={{ fontSize: displaySizes.sectionTitle, margin: 0, marginBottom: displaySizes.mediumPadding, textShadow: '0 0 10px #0f0' }}>
            SITIO DE UNIÓN
          </h2>
          <div style={{ fontSize: displaySizes.normalText, color: '#0a0' }}>
            <span style={{ color: '#0f0', fontWeight: 'bold' }}>{protein.name}</span>
            {'  +  '}
            <span style={{ color: '#ff6600', fontWeight: 'bold' }}>{molecule.name}</span>
          </div>
        </div>

        {/* Live coordinates of the box */}
        <div style={{
          border: '2px solid #ff00ff',
          borderRadius: displaySizes.smallPadding,
          padding: displaySizes.mediumPadding,
          backgroundColor: 'rgba(255, 0, 255, 0.08)'
        }}>
          <div style={{ fontSize: displaySizes.normalText, color: '#ff00ff', fontWeight: 'bold', marginBottom: displaySizes.smallPadding }}>
            ▣ Caja de búsqueda
          </div>
          <div style={{ fontSize: displaySizes.smallText, color: '#0f0' }}>
            X: {liveCoords.x.toFixed(1)}  Y: {liveCoords.y.toFixed(1)}  Z: {liveCoords.z.toFixed(1)} Å
          </div>
        </div>

        {/* Detected domains */}
        <div style={{
          border: '3px solid #0f0',
          borderRadius: displaySizes.smallPadding,
          padding: displaySizes.mediumPadding,
          backgroundColor: 'rgba(0, 255, 0, 0.06)',
          minHeight: '120px'
        }}>
          <div style={{ fontSize: displaySizes.normalText, color: '#ff00ff', fontWeight: 'bold', marginBottom: displaySizes.smallPadding }}>
            🔍 Dominios detectados
          </div>

          {detectedHotspots.length === 0 ? (
            <div style={{ fontSize: displaySizes.smallText, color: '#0a0', lineHeight: 1.6 }}>
              Mueve la caja sobre la proteína para localizar regiones de interés…
            </div>
          ) : (
            detectedHotspots.map((h, idx) => (
              <div key={h.id} style={{
                marginBottom: displaySizes.smallPadding,
                paddingBottom: displaySizes.smallPadding,
                borderBottom: idx < detectedHotspots.length - 1 ? '1px solid #0a0' : 'none'
              }}>
                <div style={{ fontSize: displaySizes.normalText, color: '#0f0', fontWeight: 'bold' }}>
                  ◆ {h.name}
                </div>
                <div style={{ fontSize: displaySizes.smallText, color: '#0a0', marginTop: '6px', lineHeight: 1.6 }}>
                  {h.description}
                </div>
                <div style={{ fontSize: displaySizes.tinyText, color: '#066', marginTop: '6px' }}>
                  tipo: <strong>{h.type}</strong> · importancia: <strong style={{
                    color: h.importance === 'critical' ? '#ff00ff' : h.importance === 'high' ? '#0f0' : '#0a0'
                  }}>{h.importance}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Nearest predefined site (what A will dock) */}
        {activeSite && (
          <div style={{
            border: '2px solid #0a0',
            borderRadius: displaySizes.smallPadding,
            padding: displaySizes.mediumPadding,
            backgroundColor: 'rgba(0, 20, 0, 0.8)'
          }}>
            <div style={{ fontSize: displaySizes.smallText, color: '#0a0' }}>
              Sitio objetivo más cercano:
            </div>
            <div style={{ fontSize: displaySizes.normalText, color: '#0f0', fontWeight: 'bold', marginTop: '4px' }}>
              {activeSite.name}
            </div>
            {activeSite.affinity_bonus > 0 && (
              <div style={{ fontSize: displaySizes.smallText, color: '#ff00ff', fontWeight: 'bold', marginTop: '6px' }}>
                Bonus de afinidad: +{(activeSite.affinity_bonus * 100).toFixed(0)}%
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ borderTop: '2px solid #0a0', paddingTop: displaySizes.mediumPadding }}>
          <div style={{ fontSize: displaySizes.smallText, color: '#0a0', lineHeight: 2 }}>
            🕹️ <strong>Stick izq</strong>: mover caja<br />
            <strong>LB / RB</strong>: profundidad (Z)<br />
            🕹️ <strong>Stick der</strong>: rotar proteína<br />
            <strong>↑ / ↓</strong>: saltar a sitio objetivo<br />
            <strong>A</strong>: hacer docking aquí · <strong>B</strong>: atrás
          </div>
        </div>
      </div>
    </div>
  );
}
