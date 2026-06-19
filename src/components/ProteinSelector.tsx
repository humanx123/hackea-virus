import { useEffect, useState } from 'react';
import type { Protein, GamepadInput } from '../types';
import { proteins } from '../data/proteins';
import type { KeyboardInput } from '../hooks/useKeyboardControls';

interface ProteinSelectorProps {
  onSelect: (protein: Protein) => void;
  onCancel: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function ProteinSelector({
  onSelect,
  onCancel,
  gamepadInput,
  keyboardInput,
}: ProteinSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastInput, setLastInput] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastInput < 150) return;

    if (
      gamepadInput.dpadUp ||
      gamepadInput.dpadDown ||
      keyboardInput.dpadUp ||
      keyboardInput.dpadDown
    ) {
      setLastInput(now);
      if (gamepadInput.dpadUp || keyboardInput.dpadUp) {
        setSelectedIndex(prev => (prev === 0 ? proteins.length - 1 : prev - 1));
      } else if (gamepadInput.dpadDown || keyboardInput.dpadDown) {
        setSelectedIndex(prev => (prev === proteins.length - 1 ? 0 : prev + 1));
      }
    }
  }, [gamepadInput, keyboardInput, lastInput]);

  useEffect(() => {
    if (gamepadInput.aPressed || keyboardInput.aPressed) {
      onSelect(proteins[selectedIndex]);
    }
  }, [gamepadInput.aPressed, keyboardInput.aPressed, selectedIndex, onSelect]);

  useEffect(() => {
    if (gamepadInput.bPressed || keyboardInput.bPressed) {
      onCancel();
    }
  }, [gamepadInput.bPressed, keyboardInput.bPressed, onCancel]);

  const protein = proteins[selectedIndex];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        color: '#0f0',
        fontFamily: '"Courier New", monospace',
      }}
    >
      <h2 style={{ fontSize: '24px', marginBottom: '30px', textShadow: '0 0 10px #0f0' }}>
        &gt; seleccionar proteína blanco
      </h2>

      <div
        style={{
          border: '2px solid #0f0',
          padding: '20px',
          backgroundColor: 'rgba(0, 20, 0, 0.8)',
          borderRadius: '4px',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          [{selectedIndex + 1}/{proteins.length}] {protein.name}
        </div>

        <div style={{ fontSize: '12px', color: '#0a0', marginBottom: '15px' }}>
          función viral
        </div>

        <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '15px' }}>
          {protein.viralFunction}
        </div>

        <div style={{ fontSize: '12px', color: '#0a0', marginBottom: '10px' }}>
          por qué es blanco
        </div>

        <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '15px' }}>
          {protein.targetRationale}
        </div>
      </div>

      <div
        style={{
          marginTop: '40px',
          fontSize: '12px',
          color: '#0a0',
          textAlign: 'center',
        }}
      >
        <div>↑↓ navegar | A seleccionar | B cancelar</div>
        <div style={{ marginTop: '10px', color: '#080' }}>
          (flechas teclado / D-pad Xbox)
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          fontSize: '11px',
          color: '#555',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        {proteins.map((p, i) => (
          <div
            key={p.id}
            style={{
              color: i === selectedIndex ? '#0f0' : '#333',
              fontWeight: i === selectedIndex ? 'bold' : 'normal',
              textShadow: i === selectedIndex ? '0 0 5px #0f0' : 'none',
            }}
          >
            {i === selectedIndex ? '» ' : '  '}
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
