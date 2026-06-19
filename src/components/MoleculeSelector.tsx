import { useRef } from 'react';
import type { Molecule, GamepadInput } from '../types';
import { molecules } from '../data/molecules';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { useMenuNav } from '../hooks/useMenuNav';
import { useScrollSelectedItem } from '../hooks/useScrollSelectedItem';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface MoleculeSelectorProps {
  onSelect: (molecule: Molecule) => void;
  onCancel: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function MoleculeSelector({
  onSelect,
  onCancel,
  gamepadInput,
  keyboardInput,
}: MoleculeSelectorProps) {
  const { index: selectedIndex, setIndex } = useMenuNav({
    itemCount: molecules.length,
    orientation: 'vertical',
    gamepadInput,
    keyboardInput,
    onSelect: i => onSelect(molecules[i]),
    onCancel,
  });

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  useScrollSelectedItem(selectedIndex, itemRefs);

  const molecule = molecules[selectedIndex];

  return (
    <ScreenFrame
      title="> SELECCIONAR MOLÉCULA"
      subtitle="Elige el ligando candidato a probar"
      controls={[
        { keys: '▲ ▼', label: 'Navegar' },
        { keys: 'A', label: 'Seleccionar' },
        { keys: 'B', label: 'Regresar' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: displaySizes.largeGap }}>
        {/* Detail panel */}
        <div style={{ border: '3px solid #0f0', padding: displaySizes.largePadding, backgroundColor: 'rgba(0, 20, 0, 0.9)', borderRadius: '8px' }}>
          <div style={{ fontSize: displaySizes.smallText, color: '#0a0', marginBottom: displaySizes.smallPadding }}>
            [{selectedIndex + 1}/{molecules.length}]
          </div>
          <div style={{ fontSize: displaySizes.subsectionTitle, fontWeight: 'bold', color: '#0f0', textShadow: '0 0 10px #0f0', marginBottom: displaySizes.smallPadding }}>
            {molecule.name}
          </div>
          <div style={{ fontSize: displaySizes.normalText, color: '#0a0', marginBottom: displaySizes.mediumPadding }}>
            {molecule.category} • {molecule.molecularWeight} g/mol
          </div>

          <div style={{ fontSize: displaySizes.normalText, lineHeight: 1.8, marginBottom: displaySizes.mediumPadding, color: '#0a0' }}>
            {molecule.description}
          </div>

          <div style={{
            fontSize: displaySizes.smallText,
            color: '#f0a',
            backgroundColor: 'rgba(255, 0, 170, 0.1)',
            padding: displaySizes.mediumPadding,
            borderRadius: '8px',
            borderLeft: '4px solid #f0a',
          }}>
            ⚠️ {molecule.disclaimer}
          </div>
        </div>

        {/* List */}
        <div style={{ border: '2px solid #003300', padding: displaySizes.mediumPadding, borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.6)' }}>
          <div style={{ fontSize: displaySizes.normalText, color: '#0f0', marginBottom: displaySizes.smallPadding, fontWeight: 'bold' }}>
            Moléculas disponibles
          </div>
          {molecules.map((m, i) => (
            <div
              key={m.id}
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
              {i === selectedIndex ? '▶ ' : '  '}{m.name}
            </div>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}
