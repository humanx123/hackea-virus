import { useRef } from 'react';
import type { Virus, ViralProtein } from '../data/viruses';
import { ProteinViewer3DReal } from './ProteinViewer3DReal';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { useMenuNav } from '../hooks/useMenuNav';
import { useScrollSelectedItem } from '../hooks/useScrollSelectedItem';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface ProteinCarouselProps {
  virus: Virus;
  onSelect: (protein: ViralProtein) => void;
  onCancel: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function ProteinCarousel({
  virus,
  onSelect,
  onCancel,
  gamepadInput,
  keyboardInput,
}: ProteinCarouselProps) {
  const { index: selectedIndex, setIndex } = useMenuNav({
    itemCount: virus.proteins.length,
    orientation: 'vertical',
    gamepadInput,
    keyboardInput,
    onSelect: i => onSelect(virus.proteins[i]),
    onCancel,
  });

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  useScrollSelectedItem(selectedIndex, itemRefs);

  const protein = virus.proteins[selectedIndex];

  return (
    <ScreenFrame
      title={virus.name}
      subtitle="> Selecciona la proteína blanco"
      controls={[
        { keys: '▲ ▼', label: 'Navegar' },
        { keys: 'A', label: 'Seleccionar' },
        { keys: 'B', label: 'Regresar' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: displaySizes.largeGap, minHeight: '560px' }}>
        {/* 3D Viewer */}
        <div style={{ border: '3px solid #0f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(0, 20, 0, 0.5)', minHeight: '560px' }}>
          <ProteinViewer3DReal protein={protein} isSelected={true} />
        </div>

        {/* Info + list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: displaySizes.largePadding }}>
          <div style={{ border: '3px solid #0f0', padding: displaySizes.largePadding, backgroundColor: 'rgba(0, 20, 0, 0.9)', borderRadius: '8px' }}>
            <div style={{ fontSize: displaySizes.smallText, color: '#0a0', marginBottom: displaySizes.smallPadding }}>
              [{selectedIndex + 1}/{virus.proteins.length}]
            </div>
            <div style={{ fontSize: displaySizes.subsectionTitle, fontWeight: 'bold', color: '#0f0', textShadow: '0 0 10px #0f0', marginBottom: displaySizes.smallPadding }}>
              {protein.name}
            </div>
            <div style={{ fontSize: displaySizes.normalText, color: '#f0a', marginBottom: displaySizes.mediumPadding, fontWeight: 'bold' }}>
              PDB: {protein.pdbId}
            </div>

            <div style={{ fontSize: displaySizes.normalText, color: '#0f0', fontWeight: 'bold', marginBottom: displaySizes.smallPadding, borderBottom: '2px solid #0f0', paddingBottom: displaySizes.smallPadding }}>
              🦠 Función viral
            </div>
            <div style={{ fontSize: displaySizes.smallText, lineHeight: 1.7, marginBottom: displaySizes.mediumPadding, color: '#0a0' }}>
              {protein.function}
            </div>

            <div style={{ fontSize: displaySizes.normalText, color: '#0f0', fontWeight: 'bold', marginBottom: displaySizes.smallPadding, borderBottom: '2px solid #0f0', paddingBottom: displaySizes.smallPadding }}>
              📋 Descripción
            </div>
            <div style={{ fontSize: displaySizes.smallText, lineHeight: 1.7, marginBottom: displaySizes.mediumPadding, color: '#0a0' }}>
              {protein.description}
            </div>

            <div style={{
              fontSize: displaySizes.smallText,
              color: '#0f0',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              padding: displaySizes.mediumPadding,
              borderRadius: '8px',
              borderLeft: '5px solid #0f0',
              fontWeight: 'bold',
            }}>
              🎯 {protein.importance}
            </div>
          </div>

          <div style={{ border: '2px solid #003300', padding: displaySizes.mediumPadding, borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.6)' }}>
            <div style={{ fontSize: displaySizes.normalText, color: '#0f0', marginBottom: displaySizes.smallPadding, fontWeight: 'bold' }}>
              Proteínas disponibles
            </div>
            {virus.proteins.map((p, i) => (
              <div
                key={p.id}
                ref={el => {
                  itemRefs.current[i] = el;
                }}
                onClick={() => setIndex(i)}
                style={{
                  padding: `${displaySizes.smallPadding} ${displaySizes.mediumPadding}`,
                  margin: '8px 0',
                  cursor: 'pointer',
                  color: i === selectedIndex ? '#0f0' : '#0a0',
                  fontSize: displaySizes.normalText,
                  fontWeight: i === selectedIndex ? 'bold' : 'normal',
                  textShadow: i === selectedIndex ? '0 0 5px #0f0' : 'none',
                  borderLeft: i === selectedIndex ? '5px solid #0f0' : '5px solid transparent',
                  backgroundColor: i === selectedIndex ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {i === selectedIndex ? '▶ ' : '  '}{p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
