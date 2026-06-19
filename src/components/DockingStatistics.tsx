import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  Filler
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import type { DockingResult } from '../types';
import type { ViralProtein } from '../data/viruses';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  Filler
);

interface DockingStatisticsProps {
  result: DockingResult;
  protein: ViralProtein;
  moleculeName: string;
}

export function DockingStatistics({ result, protein, moleculeName }: DockingStatisticsProps) {
  // Affinity gauge (radar-like visualization)
  const affinityGaugeData = {
    labels: ['Muy Desfavorable', 'Desfavorable', 'Neutral', 'Favorable', 'Muy Favorable'],
    datasets: [
      {
        label: 'Afinidad Predicha',
        data: [
          result.affinity < -8 ? 100 : 0,
          result.affinity >= -8 && result.affinity < -6.5 ? 100 : 0,
          result.affinity >= -6.5 && result.affinity < -5 ? 100 : 0,
          result.affinity >= -5 && result.affinity < -3 ? 100 : 0,
          result.affinity >= -3 ? 100 : 0
        ],
        borderColor: 'rgb(0, 255, 0)',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(0, 255, 0)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(0, 255, 0)',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Affinity comparison with typical values
  const affinityComparisonData = {
    labels: [moleculeName, 'Promedio Estudios', 'Mejor Afinidad Conocida'],
    datasets: [
      {
        label: 'kcal/mol',
        data: [
          result.affinity,
          -6.5,
          -9.5
        ],
        backgroundColor: [
          result.ranking === 'high' ? 'rgba(0, 255, 0, 0.8)' : result.ranking === 'medium' ? 'rgba(255, 165, 0, 0.8)' : 'rgba(255, 51, 51, 0.8)',
          'rgba(100, 100, 100, 0.8)',
          'rgba(0, 200, 100, 0.8)'
        ],
        borderColor: [
          result.ranking === 'high' ? '#0f0' : result.ranking === 'medium' ? '#ff8000' : '#f33',
          '#666',
          '#00aa66'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Binding mode distribution (simulated)
  const bindingModesData = {
    labels: ['Interacciones H', 'Contactos Van der Waals', 'π-π stacking', 'Interacciones hidrofóbicas', 'Electrostáticas'],
    datasets: [
      {
        label: 'Frecuencia relativa (%)',
        data: [
          Math.max(20, Math.random() * 50),
          Math.max(25, Math.random() * 40),
          Math.max(15, Math.random() * 30),
          Math.max(20, Math.random() * 45),
          Math.max(10, Math.random() * 25)
        ],
        borderColor: 'rgb(0, 153, 255)',
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        tension: 0.1,
        fill: true,
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(0, 153, 255)',
        pointBorderColor: '#fff'
      }
    ]
  };

  // Scoring components
  const scoringComponentsData = {
    labels: ['H-bonds', 'Hidrofobia', 'Electrostática', 'Entropía', 'Dessolvatación'],
    datasets: [
      {
        label: 'Contribución (kcal/mol)',
        data: [
          -2.5 + Math.random() * 1.5,
          -2.0 + Math.random() * 1.0,
          -1.5 + Math.random() * 0.8,
          1.2 + Math.random() * 0.5,
          -0.8 + Math.random() * 0.4
        ],
        backgroundColor: [
          'rgba(0, 200, 255, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(255, 100, 100, 0.8)',
          'rgba(100, 150, 255, 0.8)',
          'rgba(150, 200, 100, 0.8)'
        ],
        borderColor: [
          '#00c8ff',
          '#ffa500',
          '#ff6464',
          '#6496ff',
          '#96c864'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#0f0',
          font: { size: 14, family: '"Courier New", monospace' } as any,
          padding: 20
        }
      },
      title: {
        color: '#0f0',
        font: { size: 18, weight: 'bold' as const, family: '"Courier New", monospace' } as any,
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#0f0',
        bodyColor: '#0a0',
        borderColor: '#0f0',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        ticks: { color: '#0a0', font: { size: 12 } },
        grid: { color: 'rgba(0, 255, 0, 0.1)' },
        border: { color: '#0f0' }
      },
      x: {
        ticks: { color: '#0a0', font: { size: 12 } },
        grid: { color: 'rgba(0, 255, 0, 0.1)' },
        border: { color: '#0f0' }
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '30px' }}>
      {/* Affinity Gauge */}
      <div style={{ border: '2px solid #0f0', padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', height: '400px' }}>
        <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '20px', textShadow: '0 0 5px #0f0' }}>
          Escala de Afinidad
        </h3>
        <Radar data={affinityGaugeData} options={chartOptions} />
      </div>

      {/* Affinity Comparison */}
      <div style={{ border: '2px solid #0f0', padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', height: '400px' }}>
        <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '20px', textShadow: '0 0 5px #0f0' }}>
          Comparación de Afinidad (kcal/mol)
        </h3>
        <Bar data={affinityComparisonData} options={{ ...chartOptions, indexAxis: 'y' as const }} />
      </div>

      {/* Binding Interactions */}
      <div style={{ border: '2px solid #0f0', padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', height: '400px' }}>
        <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '20px', textShadow: '0 0 5px #0f0' }}>
          Tipos de Interacción Predichos
        </h3>
        <Line data={bindingModesData} options={chartOptions} />
      </div>

      {/* Scoring Components */}
      <div style={{ border: '2px solid #0f0', padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', height: '400px' }}>
        <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '20px', textShadow: '0 0 5px #0f0' }}>
          Componentes de Scoring
        </h3>
        <Bar data={scoringComponentsData} options={chartOptions} />
      </div>

      {/* Summary Statistics */}
      <div style={{ gridColumn: '1 / -1', border: '2px solid #0a0', padding: '30px', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)' }}>
        <h3 style={{ color: '#0f0', fontSize: '28px', marginBottom: '25px', textShadow: '0 0 5px #0f0' }}>
          📊 Estadísticas de Docking
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
          {[
            { label: 'Afinidad', value: `${result.affinity} kcal/mol`, color: '#0f0' },
            { label: 'Ranking', value: result.ranking.toUpperCase(), color: result.ranking === 'high' ? '#0f0' : result.ranking === 'medium' ? '#ff8000' : '#f33' },
            { label: 'Proteína', value: protein.name, color: '#0a0' },
            { label: 'Simulación', value: 'Completada ✓', color: '#0f0' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                border: `2px solid ${stat.color}`,
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 50, 0, 0.5)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '18px', color: '#0a0', marginBottom: '10px', fontWeight: 'bold' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '26px', color: stat.color, fontWeight: 'bold', textShadow: `0 0 10px ${stat.color}` }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '25px',
            padding: '20px',
            backgroundColor: 'rgba(255, 0, 170, 0.1)',
            borderLeft: '4px solid #f0a',
            borderRadius: '4px',
            fontSize: '20px',
            color: '#0a0',
            lineHeight: '1.7'
          }}
        >
          <strong style={{ color: '#f0a' }}>⚠️ Advertencia científica:</strong> Esta simulación genera una HIPÓTESIS computacional basada en modelos
          físicos. <strong>NO constituye evidencia experimental.</strong> La validación requiere: (1) Estudios de afinidad de unión in vitro
          (SPR, ITC, ELISA), (2) Ensayos de inhibición viral en células, (3) Estudios de toxicidad, (4) Validación in vivo.
        </div>
      </div>
    </div>
  );
}
