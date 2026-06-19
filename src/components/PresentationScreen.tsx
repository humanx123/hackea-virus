import { useEffect, useRef } from 'react';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { displaySizes } from '../styles/sizes';

interface PresentationScreenProps {
  onContinue: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function PresentationScreen({
  onContinue,
  gamepadInput,
  keyboardInput,
}: PresentationScreenProps) {
  const armed = useRef(!(gamepadInput.aPressed || keyboardInput.aPressed));

  useEffect(() => {
    const pressed = gamepadInput.aPressed || keyboardInput.aPressed;
    if (!pressed) {
      armed.current = true;
      return;
    }

    if (armed.current) {
      armed.current = false;
      onContinue();
    }
  }, [gamepadInput.aPressed, keyboardInput.aPressed, onContinue]);

  return (
      <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: `${displaySizes.mediumPadding} ${displaySizes.hugePadding} 0`,
        boxSizing: 'border-box',
        color: '#0f0',
        fontFamily: '"Courier New", monospace',
      }}
    >
      <header style={{ textAlign: 'center', flexShrink: 0 }}>
        <h1
          style={{
            fontSize: displaySizes.mainTitle,
            margin: 0,
            fontWeight: 'bold',
            letterSpacing: '3px',
            textShadow: '0 0 20px #0f0, 0 0 40px #0f0',
          }}
        >
          HACKEA UN VIRUS
        </h1>
        <div
          style={{
            marginTop: displaySizes.smallPadding,
            fontSize: displaySizes.largeText,
            color: '#0a0',
            textShadow: '0 0 10px #0a0',
          }}
        >
          docking molecular interactivo
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: displaySizes.mediumGap,
        }}
      >
        <section
          style={{
            width: '100%',
            maxWidth: '980px',
            border: '3px solid #0f0',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 20, 0, 0.78)',
            padding: displaySizes.mediumPadding,
            boxSizing: 'border-box',
            boxShadow: '0 0 24px rgba(0, 255, 0, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: displaySizes.normalText,
              lineHeight: 1.5,
              color: '#0a0',
              textAlign: 'center',
              marginBottom: displaySizes.mediumPadding,
            }}
          >
            Explora candidatos moleculares contra proteinas virales.
            <br />
            Selecciona molecula, elige proteina blanco, ejecuta simulacion de docking y observa
            predicciones de afinidad.
          </div>

          <div
            style={{
              borderLeft: '4px solid #ff00ff',
              backgroundColor: 'rgba(255, 0, 170, 0.08)',
              color: '#ff9dff',
              padding: `${displaySizes.mediumPadding} ${displaySizes.mediumPadding}`,
              borderRadius: '4px',
              fontSize: displaySizes.smallText,
              lineHeight: 1.5,
              textAlign: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(255, 0, 255, 0.18)',
            }}
          >
            <strong style={{ color: '#ffccff' }}>⚠</strong> Esto es una herramienta educativa. La
            simulacion genera hipotesis. Validacion experimental es obligatoria.
          </div>
        </section>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: displaySizes.smallText,
              color: '#ffb000',
              fontWeight: 'bold',
              marginBottom: displaySizes.smallPadding,
              textShadow: '0 0 8px rgba(255, 176, 0, 0.45)',
            }}
          >
            usa teclado (enter, flechas, x, i)
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: displaySizes.smallPadding,
              fontSize: displaySizes.largeText,
              color: '#0f0',
              fontWeight: 'bold',
              textShadow: '0 0 15px #0f0',
              animation: 'blink 1s infinite',
            }}
          >
            <span
              style={{
                minWidth: '48px',
                padding: '4px 12px',
                border: '2px solid #0f0',
                borderRadius: '6px',
                boxShadow: '0 0 12px rgba(0, 255, 0, 0.25)',
              }}
            >
              A
            </span>
            <span>Iniciar</span>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
