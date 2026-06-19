import type { Protein } from '../types';

export const proteins: Protein[] = [
  {
    id: 'protease',
    name: 'Proteasa Viral',
    viralFunction: 'Escisión de poliproteínas virales en proteínas funcionales.',
    targetRationale: 'Blanco bien conservado; inhibición bloquea maduración viral.',
  },
  {
    id: 'rna-polymerase',
    name: 'ARN Polimerasa Viral',
    viralFunction: 'Síntesis de ARN genómico y ARN mensajero viral.',
    targetRationale: 'Esencial para replicación; presentan sitios de unión selectivos.',
  },
  {
    id: 'helicase',
    name: 'Helicasa Viral',
    viralFunction: 'Desempaquetamiento de ácidos nucleicos durante replicación.',
    targetRationale: 'Actividad esencial; inhibidores pueden bloquear ciclo replicativo.',
  },
  {
    id: 'spike-protein',
    name: 'Proteína de Entrada/Fusión',
    viralFunction: 'Reconocimiento de receptor celular y fusión de membranas.',
    targetRationale: 'Determinante clave de tropismo; bloqueo impide entrada viral.',
  },
  {
    id: 'nsp5',
    name: 'Proteína No Estructural NSP5',
    viralFunction: 'Procesamiento post-traduccional de proteínas virales.',
    targetRationale: 'Sitio activo bien caracterizado; muchos inhibidores descritos en literatura.',
  },
];
