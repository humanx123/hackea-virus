import { useEffect, useRef } from 'react';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface StartScreenProps {
  onStart: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function StartScreen({
  onStart,
  gamepadInput,
  keyboardInput,
}: StartScreenProps) {
  const armed = useRef(!(gamepadInput.aPressed || keyboardInput.aPressed));

  useEffect(() => {
    const pressed = gamepadInput.aPressed || keyboardInput.aPressed;
    if (!pressed) {
      armed.current = true;
      return;
    }

    if (armed.current) {
      armed.current = false;
      onStart();
    }
  }, [gamepadInput.aPressed, keyboardInput.aPressed, onStart]);

  return (
    <ScreenFrame
      title="> HACKEA UN VIRUS"
      subtitle="docking molecular interactivo"
      contentMaxWidth={1400}
      controls={[{ keys: 'A', label: 'Iniciar' }]}
    >
      <div
        className="start-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
          gap: displaySizes.largeGap,
          alignItems: 'stretch',
        }}
      >
        <section
          style={{
            border: '3px solid #0f0',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 20, 0, 0.9)',
            padding: displaySizes.largePadding,
          }}
        >
          <div
            style={{
              fontSize: displaySizes.largeText,
              fontWeight: 'bold',
              color: '#0f0',
              textShadow: '0 0 8px #0f0',
              marginBottom: displaySizes.smallPadding,
            }}
          >
            ¿Qué hace esta demo?
          </div>

          <div
            style={{
              fontSize: displaySizes.normalText,
              lineHeight: 1.7,
              color: '#0a0',
            }}
          >
            Explora candidatos moleculares contra proteínas virales. Selecciona una molécula,
            ejecuta la simulación de docking y observa la predicción de afinidad.
          </div>

          <div
            style={{
              marginTop: displaySizes.mediumPadding,
              padding: displaySizes.mediumPadding,
              border: '3px solid #ff00ff',
              borderLeft: '10px solid #ff00ff',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 0, 255, 0.06)',
            }}
          >
            <div
              style={{
                fontSize: displaySizes.largeText,
                fontWeight: 'bold',
                color: '#ff66ff',
                marginBottom: displaySizes.smallPadding,
                textShadow: '0 0 8px #ff00ff',
              }}
            >
              Aviso científico
            </div>
            <div
              style={{
                fontSize: displaySizes.smallText,
                lineHeight: 1.6,
                color: '#0c0',
              }}
            >
              Esta herramienta es educativa. La simulación genera hipótesis y la validación
              experimental sigue siendo obligatoria.
            </div>
          </div>
        </section>

        <section
          style={{
            border: '3px solid #0f0',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 20, 0, 0.85)',
            padding: displaySizes.largePadding,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: displaySizes.largePadding,
          }}
        >
          <div>
            <div
              style={{
                fontSize: displaySizes.largeText,
                fontWeight: 'bold',
                color: '#0f0',
                textShadow: '0 0 8px #0f0',
                marginBottom: displaySizes.smallPadding,
              }}
            >
              Inicio rápido
            </div>

            <div
              style={{
                fontSize: displaySizes.normalText,
                fontWeight: 'bold',
                color: '#0f0',
                textShadow: '0 0 15px #0f0',
                animation: 'blink 1s infinite',
                marginBottom: displaySizes.smallPadding,
              }}
            >
              Presiona A para comenzar
            </div>

            <div
              style={{
                fontSize: displaySizes.normalText,
                lineHeight: 1.8,
                color: '#0a0',
              }}
            >
              (Enter en teclado | A en Xbox)
            </div>
          </div>

          <div
            style={{
              borderTop: '2px solid #003300',
              paddingTop: displaySizes.largePadding,
            }}
          >
            <div
              style={{
                fontSize: displaySizes.largeText,
                fontWeight: 'bold',
                color: '#0f0',
                marginBottom: displaySizes.smallPadding,
              }}
            >
              Estado del control
            </div>
            <div
              style={{
                fontSize: displaySizes.normalText,
                lineHeight: 1.8,
                color: gamepadInput.gamepadConnected ? '#0f0' : '#fa0',
                textShadow: gamepadInput.gamepadConnected ? '0 0 10px #0f0' : 'none',
                fontWeight: 'bold',
              }}
            >
              {gamepadInput.gamepadConnected ? 'Mando Xbox detectado' : 'Teclado listo'}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .start-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.5; }
        }
      `}</style>
    </ScreenFrame>
  );
}
