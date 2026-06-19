import { useEffect, useRef, useState } from 'react';
import type { GamepadInput, Molecule, DockingResult } from '../types';
import type { ViralProtein, Virus } from '../data/viruses';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { simulateDocking } from '../data/simulatedDocking';
import { displaySizes } from '../styles/sizes';
import { useControllerScroll } from '../hooks/useControllerScroll';

interface DockingConsoleImprovedProps {
  virus: Virus;
  protein: ViralProtein;
  molecule: Molecule;
  bindingSiteId?: string;
  onComplete: (result: DockingResult) => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

const dockingStages = [
  {
    log: 'preparando receptor (proteína viral)...',
    explanation: 'Se carga la estructura 3D de la proteína objetivo del virus.'
  },
  {
    log: 'cargando ligando (molécula candidata)...',
    explanation: 'Se prepara la molécula pequeña que queremos probar contra la proteína.'
  },
  {
    log: 'definiendo caja de búsqueda...',
    explanation: 'Se define el espacio donde puede unirse la molécula a la proteína.'
  },
  {
    log: 'inicializando motor de docking...',
    explanation: 'Se activa el algoritmo que explora cómo se une la molécula a la proteína.'
  },
  {
    log: 'explorando conformaciones...',
    explanation: 'Se generan miles de orientaciones diferentes de la molécula. Cada una es una "pose".'
  },
  {
    log: 'evaluando poses de unión...',
    explanation: 'Para cada pose, se calcula la energía y complementariedad geométrica.'
  },
  {
    log: 'identificando mejor afinidad predicha...',
    explanation: 'Se encuentran las 5-10 poses más favorables energéticamente.'
  },
  {
    log: 'advertencia: hipótesis computacional solamente',
    explanation: 'La predicción es TEÓRICA. Solo validación experimental prueba actividad real.'
  }
];

export function DockingConsoleImproved({
  virus,
  protein,
  molecule,
  bindingSiteId,
  onComplete,
  gamepadInput,
  keyboardInput,
}: DockingConsoleImprovedProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const logPanelRef = useRef<HTMLDivElement>(null);

  useControllerScroll({
    containerRef: logPanelRef,
    gamepadInput,
    keyboardInput,
    enabled: Boolean(gamepadInput || keyboardInput),
  });

  useEffect(() => {
    const runDocking = async () => {
      const duration = Math.random() * 7000 + 8000;
      const stageInterval = duration / dockingStages.length;

      setLogs([
        `> iniciando docking molecular`,
        `> virus: ${virus.name}`,
        `> proteína blanco: ${protein.name} (${protein.pdbId})`,
        `> molécula candidata: ${molecule.name}`,
        `> duración estimada: ${(duration / 1000).toFixed(1)}s`,
        '',
      ]);

      for (let i = 0; i < dockingStages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, stageInterval));

        const stage = dockingStages[i];
        setCurrentStageIndex(i);
        setExplanation(stage.explanation);
        setLogs(prev => [...prev, `[${((i + 1) / dockingStages.length * 100).toFixed(0)}%] ${stage.log}`]);
        setProgress(((i + 1) / dockingStages.length) * 100);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRunning(false);
      setLogs(prev => [...prev, '', 'docking completado ✓']);

      const result = await simulateDocking(molecule.id, protein.id, bindingSiteId);
      onComplete(result);
    };

    runDocking();
  }, [virus, protein, molecule, bindingSiteId, onComplete]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#0f0',
        fontFamily: '"Courier New", monospace',
        padding: `${displaySizes.largePadding} ${displaySizes.hugePadding} 0`,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center', flexShrink: 0 }}>
        <h1
          style={{
            fontSize: displaySizes.sectionTitle,
            margin: 0,
            fontWeight: 'bold',
            textShadow: '0 0 18px #0f0',
            letterSpacing: '2px',
          }}
        >
          &gt; DOCKING MOLECULAR EN PROGRESO
        </h1>
        <div style={{ fontSize: displaySizes.largeText, color: '#0a0', marginTop: displaySizes.smallPadding }}>
          {molecule.name} → {protein.name}
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: displaySizes.largeGap,
          padding: `${displaySizes.largePadding} 0`,
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Console */}
        <div
          style={{
            border: '3px solid #0f0',
            padding: displaySizes.largePadding,
            backgroundColor: 'rgba(0, 20, 0, 0.9)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div
            style={{
              fontSize: displaySizes.largeText,
              color: '#0f0',
              fontWeight: 'bold',
              marginBottom: displaySizes.mediumPadding,
              textShadow: '0 0 5px #0f0',
            }}
          >
            consola de simulación
          </div>

          <div
            ref={logPanelRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: displaySizes.smallText,
              lineHeight: 1.7,
              marginBottom: displaySizes.mediumPadding,
              color: '#0a0',
            }}
          >
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
          </div>

          {isRunning && (
            <div>
              <div
                style={{
                  width: '100%',
                  height: '32px',
                  border: '2px solid #0f0',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#0f0',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 12px #0f0',
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: displaySizes.normalText,
                  color: '#0f0',
                  fontWeight: 'bold',
                  marginTop: displaySizes.smallPadding,
                }}
              >
                {progress.toFixed(0)}%
              </div>
            </div>
          )}

          {!isRunning && (
            <div
              style={{
                fontSize: displaySizes.largeText,
                color: '#0f0',
                textAlign: 'center',
                fontWeight: 'bold',
                textShadow: '0 0 8px #0f0',
              }}
            >
              ✓ completado
            </div>
          )}
        </div>

        {/* Explanation Panel */}
        <div
          style={{
            border: '3px solid #0a0',
            padding: displaySizes.largePadding,
            backgroundColor: 'rgba(0, 20, 0, 0.8)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: displaySizes.largeText, color: '#0f0', fontWeight: 'bold', marginBottom: displaySizes.mediumPadding }}>
            etapa actual
          </div>

          <div
            style={{
              fontSize: displaySizes.subsectionTitle,
              fontWeight: 'bold',
              color: '#0f0',
              marginBottom: displaySizes.mediumPadding,
              textShadow: '0 0 8px #0f0',
            }}
          >
            {currentStageIndex + 1}/{dockingStages.length}
          </div>

          <div style={{ fontSize: displaySizes.normalText, lineHeight: 1.8, color: '#0a0' }}>
            {explanation}
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: displaySizes.mediumPadding,
              backgroundColor: 'rgba(0, 255, 0, 0.05)',
              borderLeft: '4px solid #0f0',
              borderRadius: '6px',
              fontSize: displaySizes.smallText,
              lineHeight: 1.6,
              color: '#0a0',
            }}
          >
            <strong>💡 Nota:</strong> El docking genera hipótesis. La validación experimental es obligatoria.
          </div>
        </div>
      </main>
    </div>
  );
}
