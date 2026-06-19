import type { ReactNode } from 'react';
import type { GamepadInput } from '../types';
import type { KeyboardInput } from '../hooks/useKeyboardControls';
import { useMenuNav } from '../hooks/useMenuNav';
import { ScreenFrame } from './ScreenFrame';
import { displaySizes } from '../styles/sizes';

interface ScienceInfoProps {
  onClose: () => void;
  gamepadInput: GamepadInput;
  keyboardInput: KeyboardInput;
}

export function ScienceInfo({
  onClose,
  gamepadInput,
  keyboardInput,
}: ScienceInfoProps) {
  // A or B closes (armed, shared navigation behaviour).
  useMenuNav({
    itemCount: 1,
    gamepadInput,
    keyboardInput,
    onSelect: onClose,
    onCancel: onClose,
  });

  return (
    <ScreenFrame
      title="> EXPLICACIÓN CIENTÍFICA"
      subtitle="Cómo funciona —y qué NO prueba— esta simulación"
      contentMaxWidth={1200}
      gamepadInput={gamepadInput}
      keyboardInput={keyboardInput}
      controls={[
        { keys: 'A', label: 'Cerrar' },
        { keys: 'B', label: 'Cerrar' },
      ]}
    >
      <div
        style={{
          border: '3px solid #0f0',
          padding: displaySizes.largePadding,
          backgroundColor: 'rgba(0, 20, 0, 0.9)',
          borderRadius: '8px',
        }}
      >
        <Section title="¿qué es docking molecular?">
          Simulación computacional que predice cómo se une un ligando (molécula pequeña) a una
          proteína blanco. Explora miles de orientaciones y conformaciones para encontrar poses con
          mayor complementariedad geométrica y energética. No valida actividad biológica.
        </Section>

        <Section title="¿qué es una proteína blanco?">
          Proteína viral cuya función es esencial para el ciclo replicativo del virus. Inhibir su
          función o bloquear su sitio activo podría interrumpir la infección. En docking, buscamos
          moléculas que se unan con afinidad favorable.
        </Section>

        <Section title="¿qué es un ligando?">
          Molécula pequeña (candidato farmacológico) que se une a la proteína blanco. En este
          contexto, exploramos moléculas naturales, análogos sintéticos y compuestos reposicionados
          como hipótesis de exploración computacional.
        </Section>

        <Section title="¿qué significa afinidad?">
          Medida en kcal/mol de la estabilidad de la interacción ligando-proteína predicha. Valores
          más negativos sugieren unión más favorable. Regla empírica: &lt; -8.0 = afinidad alta,
          -8.0 a -6.5 = media, &gt; -6.5 = baja. NO implica potencia antiviral.
        </Section>

        <Section title="¿por qué no demuestra actividad antiviral?">
          Una afinidad computacional favorable es solo el primer paso. No valida:
          <List items={[
            'biodisponibilidad o solubilidad',
            'permeabilidad de membranas',
            'farmacocinética in vivo',
            'toxicidad celular',
            'efectos pleiotrópicos',
            'inhibición real de replicación viral',
          ]} />
        </Section>

        <Section title="¿qué experimentos son necesarios?">
          Para validar que un candidato es un antiviral real:
          <List items={[
            'ensayos de actividad enzimática (in vitro)',
            'ensayos de inhibición de replicación viral en cultivo celular',
            'citotoxicidad en células hospederas',
            'selectividad vs. proteínas celulares',
            'estudios de farmacocinética',
            'modelos in vivo (animal)',
            'ensayos clínicos (humanos)',
            'controles negativos y positivos en cada etapa',
            'replicados independientes',
          ]} />
        </Section>

        <Section title="conclusión" last>
          <div style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#0f0', fontSize: displaySizes.largeText, marginTop: displaySizes.smallPadding }}>
            "La simulación propone. El laboratorio comprueba."
          </div>
          <div style={{ marginTop: displaySizes.smallPadding, lineHeight: 1.8, fontSize: displaySizes.normalText, color: '#0a0' }}>
            Esta herramienta es educativa. Muestra cómo los científicos usan docking molecular para
            generar hipótesis. Pero la validación experimental es irreemplazable y obligatoria antes
            de considerar cualquier aplicación terapéutica.
          </div>
        </Section>
      </div>
    </ScreenFrame>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  last?: boolean;
}

function Section({ title, children, last }: SectionProps) {
  return (
    <div style={{
      marginBottom: last ? 0 : displaySizes.largePadding,
      paddingBottom: last ? 0 : displaySizes.mediumPadding,
      borderBottom: last ? 'none' : '1px solid #033',
    }}>
      <div
        style={{
          fontSize: displaySizes.largeText,
          fontWeight: 'bold',
          color: '#0f0',
          textShadow: '0 0 6px #0f0',
          marginBottom: displaySizes.smallPadding,
        }}
      >
        ▶ {title}
      </div>
      <div style={{ fontSize: displaySizes.normalText, lineHeight: 1.8, color: '#0a0' }}>{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ marginTop: displaySizes.smallPadding, marginBottom: 0, color: '#0a0', lineHeight: 1.9, paddingLeft: '1.4em' }}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
