import type { GamepadInput } from '../types';

interface GamepadStatusProps {
  gamepadInput: GamepadInput;
}

export function GamepadStatus({ gamepadInput }: GamepadStatusProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        fontSize: '12px',
        color: '#0f0',
        fontFamily: '"Courier New", monospace',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        border: '1px solid #0f0',
        borderRadius: '4px',
        textAlign: 'right',
        zIndex: 100,
      }}
    >
      {gamepadInput.gamepadConnected ? (
        <>
          <div>🎮 Xbox detectado</div>
          <div style={{ fontSize: '10px', color: '#0a0', marginTop: '4px' }}>
            conectado
          </div>
        </>
      ) : (
        <>
          <div>🎮 Xbox no detectado</div>
          <div style={{ fontSize: '10px', color: '#fa0', marginTop: '4px' }}>
            usa teclado
          </div>
        </>
      )}
    </div>
  );
}
