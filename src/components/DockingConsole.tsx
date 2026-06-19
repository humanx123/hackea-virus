import { useEffect, useState } from 'react';
import type { Molecule, Protein, DockingResult } from '../types';
import { simulateDocking } from '../data/simulatedDocking';

interface DockingConsoleProps {
  molecule: Molecule;
  protein: Protein;
  onComplete: (result: DockingResult) => void;
}

export function DockingConsole({ molecule, protein, onComplete }: DockingConsoleProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const dockingStages = [
    'loading ligand...',
    'preparing receptor...',
    'defining search box...',
    'running docking engine...',
    'exploring conformations...',
    'scoring binding poses...',
    'best predicted affinity found...',
    'warning: computational hypothesis only',
    'experimental validation required',
  ];

  useEffect(() => {
    const runDocking = async () => {
      const duration = Math.random() * 7000 + 8000;
      const stageInterval = duration / dockingStages.length;
      let currentLog: string[] = [];

      setLogs([
        `> docking ${molecule.name} en ${protein.name}`,
        `> iniciando simulación molecular...`,
        '',
      ]);

      for (let i = 0; i < dockingStages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, stageInterval));
        currentLog = [...currentLog, `[${((i + 1) / dockingStages.length * 100).toFixed(0)}%] ${dockingStages[i]}`];
        setLogs(prev => [...prev, dockingStages[i]]);
        setProgress(((i + 1) / dockingStages.length) * 100);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRunning(false);

      const result = await simulateDocking(molecule.id, protein.id);
      setLogs(prev => [
        ...prev,
        '',
        `resultado:`,
        `> afinidad predicha: ${result.affinity} kcal/mol`,
        `> ranking: ${result.ranking === 'high' ? 'POTENCIAL ALTO' : result.ranking === 'medium' ? 'POTENCIAL MEDIO' : 'POTENCIAL BAJO'}`,
        '',
      ]);

      onComplete(result);
    };

    runDocking();
  }, [molecule, protein, onComplete]);

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
      <h2 style={{ fontSize: '20px', marginBottom: '30px', textShadow: '0 0 10px #0f0' }}>
        &gt; docking molecular en progreso
      </h2>

      <div
        style={{
          border: '2px solid #0f0',
          padding: '20px',
          backgroundColor: 'rgba(0, 20, 0, 0.9)',
          borderRadius: '4px',
          maxWidth: '700px',
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#0f0',
            fontWeight: 'bold',
            marginBottom: '15px',
            textShadow: '0 0 5px #0f0',
          }}
        >
          {molecule.name} + {protein.name}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            fontSize: '12px',
            lineHeight: '1.6',
            marginBottom: '15px',
            color: '#0a0',
          }}
        >
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>

        {isRunning && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  border: '1px solid #0f0',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#0f0',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px #0f0',
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#0a0',
                  marginTop: '5px',
                }}
              >
                {progress.toFixed(0)}%
              </div>
            </div>
          </>
        )}

        {!isRunning && (
          <div
            style={{
              fontSize: '12px',
              color: '#0f0',
              textAlign: 'center',
              fontWeight: 'bold',
              textShadow: '0 0 5px #0f0',
            }}
          >
            ✓ docking completado
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '30px',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        simulación en progreso... por favor espere
      </div>
    </div>
  );
}
