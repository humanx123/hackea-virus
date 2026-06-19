import { useRef } from 'react';
import type { Virus } from '../data/viruses';
import { viruses } from '../data/viruses';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { useMenuNav } from '../hooks/useMenuNav';
import { useScrollSelectedItem } from '../hooks/useScrollSelectedItem';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface VirusSelectorProps {
  onSelect: (virus: Virus) => void;
  onCancel: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function VirusSelector({
  onSelect,
  onCancel,
  gamepadInput,
  keyboardInput,
}: VirusSelectorProps) {
  const { index: selectedIndex, setIndex } = useMenuNav({
    itemCount: viruses.length,
    orientation: 'horizontal',
    gamepadInput,
    keyboardInput,
    onSelect: i => onSelect(viruses[i]),
    onCancel,
  });

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  useScrollSelectedItem(selectedIndex, itemRefs);

  const virus = viruses[selectedIndex];

  return (
    <ScreenFrame
      title="> SELECCIONAR VIRUS"
      subtitle="Elige un patógeno para explorar sus proteínas"
      controls={[
        { keys: '◄ ►', label: 'Navegar' },
        { keys: 'A', label: 'Seleccionar' },
        { keys: 'B', label: 'Cancelar' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: displaySizes.largeGap }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: displaySizes.smallPadding, justifyContent: 'center' }}>
          {viruses.map((v, i) => (
            <div
              key={v.id}
              ref={el => {
                itemRefs.current[i] = el;
              }}
              onClick={() => setIndex(i)}
              style={{
                padding: `${displaySizes.mediumPadding} ${displaySizes.largePadding}`,
                border: i === selectedIndex ? '3px solid #0f0' : '2px solid #003300',
                borderRadius: '8px',
                backgroundColor: i === selectedIndex ? 'rgba(0, 255, 0, 0.15)' : 'rgba(0, 50, 0, 0.4)',
                cursor: 'pointer',
                textAlign: 'center',
                color: i === selectedIndex ? '#0f0' : '#0a0',
                textShadow: i === selectedIndex ? '0 0 10px #0f0' : 'none',
                fontWeight: i === selectedIndex ? 'bold' : 'normal',
                fontSize: displaySizes.largeText,
                transition: 'all 0.2s',
              }}
            >
              {i === selectedIndex ? '▶ ' : '  '}{v.name}
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ border: '3px solid #0f0', padding: displaySizes.largePadding, backgroundColor: 'rgba(0, 20, 0, 0.9)', borderRadius: '8px' }}>
          <div style={{ fontSize: displaySizes.subsectionTitle, fontWeight: 'bold', marginBottom: displaySizes.smallPadding, textShadow: '0 0 10px #0f0' }}>
            {virus.name}
          </div>
          <div style={{ fontSize: displaySizes.normalText, color: '#0a0', marginBottom: displaySizes.largePadding, fontStyle: 'italic' }}>
            {virus.scientificName}
          </div>

          <div style={{ fontSize: displaySizes.normalText, lineHeight: 1.8, marginBottom: displaySizes.largePadding, color: '#0a0' }}>
            <div><strong>Familia:</strong> {virus.family}</div>
            <div><strong>Género:</strong> {virus.genus}</div>
            <div><strong>Tipo:</strong> {virus.type}</div>
            <div><strong>Genoma:</strong> {virus.genome}</div>
          </div>

          <div style={{
            fontSize: displaySizes.normalText,
            color: '#f0a',
            backgroundColor: 'rgba(255, 0, 170, 0.12)',
            padding: displaySizes.mediumPadding,
            borderRadius: '8px',
            borderLeft: '4px solid #f0a',
            marginBottom: displaySizes.largePadding,
            fontWeight: 'bold',
            lineHeight: 1.6,
          }}>
            ⚠️ IMPORTANCIA EPIDEMIOLÓGICA
            <div style={{ marginTop: displaySizes.smallPadding, fontSize: displaySizes.smallText, fontWeight: 'normal' }}>
              {virus.epidemiologicalImportance}
            </div>
          </div>

          <div style={{ fontSize: displaySizes.normalText, color: '#0a0', lineHeight: 1.8 }}>
            {virus.description}
          </div>

          <div style={{ fontSize: displaySizes.normalText, color: '#066', marginTop: displaySizes.largePadding, textAlign: 'center', fontWeight: 'bold' }}>
            🔬 {virus.proteins.length} proteínas disponibles
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
