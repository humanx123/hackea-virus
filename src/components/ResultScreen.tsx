import type { Molecule, Protein, DockingResult, GamepadInput } from '../types';
import type { ViralProtein } from '../data/viruses';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { getAffinityDescription } from '../data/simulatedDocking';
import { getBindingSite } from '../data/bindingSites';
import { MolecularViewer } from './MolecularViewer';
import { useMenuNav } from '../hooks/useMenuNav';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface ResultScreenProps {
  molecule: Molecule;
  protein: Protein;
  viralProtein?: ViralProtein;
  bindingSiteId?: string | null;
  result: DockingResult;
  onRepeat: () => void;
  onInfo: () => void;
  onMenu: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

const rankingColor = { high: '#0f0', medium: '#fa0', low: '#f33' } as const;
const rankingLabel = {
  high: '◆◆◆ POTENCIAL ALTO',
  medium: '◆◆ POTENCIAL MEDIO',
  low: '◆ POTENCIAL BAJO',
} as const;

export function ResultScreen({
  molecule,
  protein,
  viralProtein,
  bindingSiteId,
  result,
  onRepeat,
  onInfo,
  onMenu,
  gamepadInput,
  keyboardInput,
}: ResultScreenProps) {
  // A = repeat, Y = info, B = menu (armed, shared with every other screen)
  useMenuNav({
    itemCount: 1,
    gamepadInput,
    keyboardInput,
    onSelect: onRepeat,
    onCancel: onMenu,
    onExtra: onInfo,
  });

  const color = rankingColor[result.ranking];
  const site = viralProtein && bindingSiteId ? getBindingSite(viralProtein.pdbId, bindingSiteId) : null;

  const labelStyle = { fontSize: displaySizes.smallText, color: '#0a0', marginBottom: '4px' } as const;
  const sectionStyle = { marginBottom: displaySizes.mediumPadding } as const;

  return (
    <ScreenFrame
      title="> RESULTADOS DE DOCKING"
      subtitle="Complejo proteína–ligando predicho"
      contentMaxWidth={1400}
      gamepadInput={gamepadInput}
      keyboardInput={keyboardInput}
      controls={[
        { keys: 'A', label: 'Repetir' },
        { keys: 'Y', label: 'Información' },
        { keys: 'B', label: 'Menú' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: displaySizes.largeGap, alignItems: 'stretch' }}>
        {/* Complex viewer */}
        <div style={{ border: '3px solid #0f0', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', padding: displaySizes.mediumPadding, minHeight: '680px' }}>
          {viralProtein && bindingSiteId ? (
            <MolecularViewer molecule={molecule} protein={protein} viralProtein={viralProtein} bindingSiteId={bindingSiteId} />
          ) : (
            <MolecularViewer molecule={molecule} protein={protein} />
          )}
        </div>

        {/* Results */}
        <div style={{ border: '3px solid #0f0', borderRadius: '8px', backgroundColor: 'rgba(0, 20, 0, 0.8)', padding: displaySizes.largePadding }}>
          <div style={sectionStyle}>
            <div style={labelStyle}>molécula</div>
            <div style={{ fontSize: displaySizes.largeText, color: '#0f0', textShadow: '0 0 5px #0f0', fontWeight: 'bold' }}>
              {molecule.name}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>proteína blanco</div>
            <div style={{ fontSize: displaySizes.largeText, color: '#0f0', textShadow: '0 0 5px #0f0', fontWeight: 'bold' }}>
              {protein.name}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>afinidad predicha</div>
            <div style={{ fontSize: displaySizes.mainTitle, color, textShadow: `0 0 15px ${color}`, fontWeight: 'bold' }}>
              {result.affinity} <span style={{ fontSize: displaySizes.largeText }}>kcal/mol</span>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>ranking hipotético</div>
            <div style={{ fontSize: displaySizes.normalText, color, textShadow: `0 0 5px ${color}`, fontWeight: 'bold' }}>
              {rankingLabel[result.ranking]}
            </div>
          </div>

          {site && (
            <div style={{ ...sectionStyle, borderTop: '2px solid #0a0', paddingTop: displaySizes.mediumPadding }}>
              <div style={labelStyle}>sitio de unión</div>
              <div style={{ fontSize: displaySizes.normalText, color: '#ff00ff', textShadow: '0 0 5px #ff00ff', fontWeight: 'bold' }}>
                {site.name}
              </div>
              <div style={{ fontSize: displaySizes.smallText, color: '#0a0', marginTop: '6px', lineHeight: 1.6 }}>
                {site.description}
              </div>
            </div>
          )}

          <div style={{ fontSize: displaySizes.smallText, lineHeight: 1.7, color: '#0a0', paddingTop: displaySizes.mediumPadding, borderTop: '2px solid #0a0', marginBottom: displaySizes.mediumPadding }}>
            {getAffinityDescription(result.affinity, result.ranking)}
          </div>

          <div style={{
            fontSize: displaySizes.smallText,
            color: '#f0a',
            backgroundColor: 'rgba(255, 0, 170, 0.1)',
            padding: displaySizes.mediumPadding,
            borderRadius: '6px',
            borderLeft: '4px solid #f0a',
            lineHeight: 1.6,
          }}>
            ⚠️ Esto NO es evidencia experimental. Una afinidad computacional favorable
            requiere validación in vitro.
          </div>
        </div>
      </div>

      {/* Call to action: de la hipótesis a la validación experimental */}
      <div
        style={{
          marginTop: displaySizes.largeGap,
          border: '3px solid #ff00ff',
          borderLeft: '10px solid #ff00ff',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 0, 255, 0.06)',
          padding: displaySizes.largePadding,
        }}
      >
        <div style={{ fontSize: displaySizes.largeText, color: '#ff66ff', fontWeight: 'bold', marginBottom: displaySizes.smallPadding, textShadow: '0 0 8px #ff00ff' }}>
          📣 De la hipótesis a la cura: la simulación es apenas el primer paso
        </div>
        <div style={{ fontSize: displaySizes.normalText, color: '#0c0', lineHeight: 1.8 }}>
          Este resultado es una <strong style={{ color: '#0f0' }}>predicción computacional</strong>, un punto
          de partida. Comprobar si una molécula realmente neutraliza un virus exige
          <strong style={{ color: '#0f0' }}> experimentos reales</strong>: ensayos in vitro, modelos celulares,
          estudios in vivo y fases clínicas. Todo ello demanda laboratorios, reactivos, tiempo y, sobre todo,
          <strong style={{ color: '#0f0' }}> financiamiento e infraestructura institucional sostenida</strong>.
        </div>
        <div style={{ fontSize: displaySizes.normalText, color: '#0c0', lineHeight: 1.8, marginTop: displaySizes.smallPadding }}>
          Sin el respaldo de universidades, centros de investigación y fondos públicos y privados, miles de
          hipótesis prometedoras nunca llegan a probarse. <strong style={{ color: '#ff66ff' }}>Apostar por la
          ciencia experimental —y por quienes la hacen— es apostar por la salud de todos.</strong>
        </div>
      </div>
    </ScreenFrame>
  );
}
