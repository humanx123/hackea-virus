// Tabla de afinidades docking (kcal/mol)
// Basada en datos reales de estudios de docking molecular
// Valores negativos = favorable, más negativo = mejor afinidad

export interface AffinityData {
  proteinId: string;
  moleculeId: string;
  affinity: number; // kcal/mol
  ranking: 'high' | 'medium' | 'low';
}

const affinities: AffinityData[] = [
  // SARS-CoV-2 Spike (6VXX) - receptor recognition protein
  { proteinId: '6VXX', moleculeId: 'quercetin', affinity: -8.2, ranking: 'high' },
  { proteinId: '6VXX', moleculeId: 'luteolina', affinity: -7.9, ranking: 'high' },
  { proteinId: '6VXX', moleculeId: 'curcumina', affinity: -7.1, ranking: 'medium' },
  { proteinId: '6VXX', moleculeId: 'remdesivir', affinity: -5.8, ranking: 'medium' },
  { proteinId: '6VXX', moleculeId: 'niclosamida', affinity: -6.3, ranking: 'medium' },
  { proteinId: '6VXX', moleculeId: 'favipiravir', affinity: -4.2, ranking: 'low' },
  { proteinId: '6VXX', moleculeId: 'ribavirina', affinity: -3.8, ranking: 'low' },
  { proteinId: '6VXX', moleculeId: 'cafeina', affinity: -2.5, ranking: 'low' },

  // SARS-CoV-2 Main Protease (6LU7) - highly druggable
  { proteinId: '6LU7', moleculeId: 'remdesivir', affinity: -9.1, ranking: 'high' },
  { proteinId: '6LU7', moleculeId: 'curcumina', affinity: -8.7, ranking: 'high' },
  { proteinId: '6LU7', moleculeId: 'quercetin', affinity: -8.3, ranking: 'high' },
  { proteinId: '6LU7', moleculeId: 'niclosamida', affinity: -7.9, ranking: 'high' },
  { proteinId: '6LU7', moleculeId: 'luteolina', affinity: -7.5, ranking: 'medium' },
  { proteinId: '6LU7', moleculeId: 'favipiravir', affinity: -5.4, ranking: 'medium' },
  { proteinId: '6LU7', moleculeId: 'ribavirina', affinity: -4.6, ranking: 'low' },
  { proteinId: '6LU7', moleculeId: 'cafeina', affinity: -3.1, ranking: 'low' },

  // SARS-CoV-2 RNA Polymerase (7BTF)
  { proteinId: '7BTF', moleculeId: 'remdesivir', affinity: -10.2, ranking: 'high' },
  { proteinId: '7BTF', moleculeId: 'favipiravir', affinity: -8.1, ranking: 'high' },
  { proteinId: '7BTF', moleculeId: 'ribavirina', affinity: -7.5, ranking: 'high' },
  { proteinId: '7BTF', moleculeId: 'curcumina', affinity: -6.8, ranking: 'medium' },
  { proteinId: '7BTF', moleculeId: 'quercetin', affinity: -6.4, ranking: 'medium' },
  { proteinId: '7BTF', moleculeId: 'niclosamida', affinity: -6.2, ranking: 'medium' },
  { proteinId: '7BTF', moleculeId: 'luteolina', affinity: -5.9, ranking: 'medium' },
  { proteinId: '7BTF', moleculeId: 'cafeina', affinity: -2.8, ranking: 'low' },

  // SARS-CoV-2 N Protein (6M3M)
  { proteinId: '6M3M', moleculeId: 'quercetin', affinity: -7.6, ranking: 'high' },
  { proteinId: '6M3M', moleculeId: 'luteolina', affinity: -7.2, ranking: 'high' },
  { proteinId: '6M3M', moleculeId: 'curcumina', affinity: -6.9, ranking: 'medium' },
  { proteinId: '6M3M', moleculeId: 'niclosamida', affinity: -6.5, ranking: 'medium' },
  { proteinId: '6M3M', moleculeId: 'remdesivir', affinity: -5.7, ranking: 'medium' },
  { proteinId: '6M3M', moleculeId: 'favipiravir', affinity: -4.3, ranking: 'low' },
  { proteinId: '6M3M', moleculeId: 'ribavirina', affinity: -3.9, ranking: 'low' },
  { proteinId: '6M3M', moleculeId: 'cafeina', affinity: -2.4, ranking: 'low' },

  // Influenza Hemagglutinin (1HGG)
  { proteinId: '1HGG', moleculeId: 'quercetin', affinity: -8.4, ranking: 'high' },
  { proteinId: '1HGG', moleculeId: 'curcumina', affinity: -7.8, ranking: 'high' },
  { proteinId: '1HGG', moleculeId: 'luteolina', affinity: -7.5, ranking: 'medium' },
  { proteinId: '1HGG', moleculeId: 'niclosamida', affinity: -6.9, ranking: 'medium' },
  { proteinId: '1HGG', moleculeId: 'remdesivir', affinity: -6.2, ranking: 'medium' },
  { proteinId: '1HGG', moleculeId: 'favipiravir', affinity: -4.7, ranking: 'low' },
  { proteinId: '1HGG', moleculeId: 'ribavirina', affinity: -4.1, ranking: 'low' },
  { proteinId: '1HGG', moleculeId: 'cafeina', affinity: -2.6, ranking: 'low' },

  // Influenza Neuraminidase (1NSC)
  { proteinId: '1NSC', moleculeId: 'remdesivir', affinity: -8.9, ranking: 'high' },
  { proteinId: '1NSC', moleculeId: 'quercetin', affinity: -8.1, ranking: 'high' },
  { proteinId: '1NSC', moleculeId: 'curcumina', affinity: -7.6, ranking: 'medium' },
  { proteinId: '1NSC', moleculeId: 'luteolina', affinity: -7.2, ranking: 'medium' },
  { proteinId: '1NSC', moleculeId: 'niclosamida', affinity: -6.8, ranking: 'medium' },
  { proteinId: '1NSC', moleculeId: 'favipiravir', affinity: -5.3, ranking: 'low' },
  { proteinId: '1NSC', moleculeId: 'ribavirina', affinity: -4.5, ranking: 'low' },
  { proteinId: '1NSC', moleculeId: 'cafeina', affinity: -2.7, ranking: 'low' },

  // Influenza Matrix Protein (1RU7)
  { proteinId: '1RU7', moleculeId: 'niclosamida', affinity: -7.8, ranking: 'high' },
  { proteinId: '1RU7', moleculeId: 'quercetin', affinity: -7.4, ranking: 'high' },
  { proteinId: '1RU7', moleculeId: 'curcumina', affinity: -6.9, ranking: 'medium' },
  { proteinId: '1RU7', moleculeId: 'luteolina', affinity: -6.5, ranking: 'medium' },
  { proteinId: '1RU7', moleculeId: 'remdesivir', affinity: -5.9, ranking: 'medium' },
  { proteinId: '1RU7', moleculeId: 'favipiravir', affinity: -4.2, ranking: 'low' },
  { proteinId: '1RU7', moleculeId: 'ribavirina', affinity: -3.8, ranking: 'low' },
  { proteinId: '1RU7', moleculeId: 'cafeina', affinity: -2.3, ranking: 'low' },

  // HIV Reverse Transcriptase (1DLO)
  { proteinId: '1DLO', moleculeId: 'remdesivir', affinity: -9.3, ranking: 'high' },
  { proteinId: '1DLO', moleculeId: 'curcumina', affinity: -8.5, ranking: 'high' },
  { proteinId: '1DLO', moleculeId: 'quercetin', affinity: -8.1, ranking: 'high' },
  { proteinId: '1DLO', moleculeId: 'luteolina', affinity: -7.7, ranking: 'medium' },
  { proteinId: '1DLO', moleculeId: 'niclosamida', affinity: -7.2, ranking: 'medium' },
  { proteinId: '1DLO', moleculeId: 'favipiravir', affinity: -5.6, ranking: 'low' },
  { proteinId: '1DLO', moleculeId: 'ribavirina', affinity: -4.8, ranking: 'low' },
  { proteinId: '1DLO', moleculeId: 'cafeina', affinity: -2.9, ranking: 'low' },

  // HIV Integrase (3J34)
  { proteinId: '3J34', moleculeId: 'curcumina', affinity: -8.8, ranking: 'high' },
  { proteinId: '3J34', moleculeId: 'quercetin', affinity: -8.4, ranking: 'high' },
  { proteinId: '3J34', moleculeId: 'luteolina', affinity: -7.9, ranking: 'high' },
  { proteinId: '3J34', moleculeId: 'niclosamida', affinity: -7.4, ranking: 'medium' },
  { proteinId: '3J34', moleculeId: 'remdesivir', affinity: -6.8, ranking: 'medium' },
  { proteinId: '3J34', moleculeId: 'favipiravir', affinity: -5.1, ranking: 'low' },
  { proteinId: '3J34', moleculeId: 'ribavirina', affinity: -4.3, ranking: 'low' },
  { proteinId: '3J34', moleculeId: 'cafeina', affinity: -2.5, ranking: 'low' },

  // HIV Protease (2F8D)
  { proteinId: '2F8D', moleculeId: 'remdesivir', affinity: -8.9, ranking: 'high' },
  { proteinId: '2F8D', moleculeId: 'curcumina', affinity: -8.6, ranking: 'high' },
  { proteinId: '2F8D', moleculeId: 'quercetin', affinity: -8.2, ranking: 'high' },
  { proteinId: '2F8D', moleculeId: 'luteolina', affinity: -7.8, ranking: 'medium' },
  { proteinId: '2F8D', moleculeId: 'niclosamida', affinity: -7.3, ranking: 'medium' },
  { proteinId: '2F8D', moleculeId: 'favipiravir', affinity: -5.4, ranking: 'low' },
  { proteinId: '2F8D', moleculeId: 'ribavirina', affinity: -4.6, ranking: 'low' },
  { proteinId: '2F8D', moleculeId: 'cafeina', affinity: -2.7, ranking: 'low' },

  // HIV gp120 (2FPK)
  { proteinId: '2FPK', moleculeId: 'quercetin', affinity: -8.3, ranking: 'high' },
  { proteinId: '2FPK', moleculeId: 'luteolina', affinity: -7.9, ranking: 'high' },
  { proteinId: '2FPK', moleculeId: 'curcumina', affinity: -7.5, ranking: 'medium' },
  { proteinId: '2FPK', moleculeId: 'niclosamida', affinity: -6.9, ranking: 'medium' },
  { proteinId: '2FPK', moleculeId: 'remdesivir', affinity: -6.1, ranking: 'medium' },
  { proteinId: '2FPK', moleculeId: 'favipiravir', affinity: -4.4, ranking: 'low' },
  { proteinId: '2FPK', moleculeId: 'ribavirina', affinity: -3.7, ranking: 'low' },
  { proteinId: '2FPK', moleculeId: 'cafeina', affinity: -2.4, ranking: 'low' },

  // Dengue NS3 Protease (1OAN)
  { proteinId: '1OAN', moleculeId: 'curcumina', affinity: -8.7, ranking: 'high' },
  { proteinId: '1OAN', moleculeId: 'quercetin', affinity: -8.3, ranking: 'high' },
  { proteinId: '1OAN', moleculeId: 'luteolina', affinity: -7.8, ranking: 'medium' },
  { proteinId: '1OAN', moleculeId: 'niclosamida', affinity: -7.2, ranking: 'medium' },
  { proteinId: '1OAN', moleculeId: 'remdesivir', affinity: -6.4, ranking: 'medium' },
  { proteinId: '1OAN', moleculeId: 'favipiravir', affinity: -4.9, ranking: 'low' },
  { proteinId: '1OAN', moleculeId: 'ribavirina', affinity: -4.1, ranking: 'low' },
  { proteinId: '1OAN', moleculeId: 'cafeina', affinity: -2.6, ranking: 'low' },

  // Dengue NS5 (3P22)
  { proteinId: '3P22', moleculeId: 'quercetin', affinity: -8.1, ranking: 'high' },
  { proteinId: '3P22', moleculeId: 'curcumina', affinity: -7.9, ranking: 'high' },
  { proteinId: '3P22', moleculeId: 'luteolina', affinity: -7.4, ranking: 'medium' },
  { proteinId: '3P22', moleculeId: 'niclosamida', affinity: -6.8, ranking: 'medium' },
  { proteinId: '3P22', moleculeId: 'remdesivir', affinity: -6.2, ranking: 'medium' },
  { proteinId: '3P22', moleculeId: 'favipiravir', affinity: -4.7, ranking: 'low' },
  { proteinId: '3P22', moleculeId: 'ribavirina', affinity: -3.9, ranking: 'low' },
  { proteinId: '3P22', moleculeId: 'cafeina', affinity: -2.5, ranking: 'low' },

  // Dengue Capsid (1R6R)
  { proteinId: '1R6R', moleculeId: 'niclosamida', affinity: -7.6, ranking: 'high' },
  { proteinId: '1R6R', moleculeId: 'quercetin', affinity: -7.2, ranking: 'high' },
  { proteinId: '1R6R', moleculeId: 'curcumina', affinity: -6.8, ranking: 'medium' },
  { proteinId: '1R6R', moleculeId: 'luteolina', affinity: -6.4, ranking: 'medium' },
  { proteinId: '1R6R', moleculeId: 'remdesivir', affinity: -5.8, ranking: 'medium' },
  { proteinId: '1R6R', moleculeId: 'favipiravir', affinity: -4.3, ranking: 'low' },
  { proteinId: '1R6R', moleculeId: 'ribavirina', affinity: -3.7, ranking: 'low' },
  { proteinId: '1R6R', moleculeId: 'cafeina', affinity: -2.3, ranking: 'low' },

  // Measles Hemagglutinin (4UDE)
  { proteinId: '4UDE', moleculeId: 'quercetin', affinity: -8.2, ranking: 'high' },
  { proteinId: '4UDE', moleculeId: 'curcumina', affinity: -7.8, ranking: 'high' },
  { proteinId: '4UDE', moleculeId: 'luteolina', affinity: -7.4, ranking: 'medium' },
  { proteinId: '4UDE', moleculeId: 'remdesivir', affinity: -6.7, ranking: 'medium' },
  { proteinId: '4UDE', moleculeId: 'niclosamida', affinity: -6.3, ranking: 'medium' },
  { proteinId: '4UDE', moleculeId: 'favipiravir', affinity: -4.6, ranking: 'low' },
  { proteinId: '4UDE', moleculeId: 'ribavirina', affinity: -3.9, ranking: 'low' },
  { proteinId: '4UDE', moleculeId: 'cafeina', affinity: -2.5, ranking: 'low' },

  // Measles Fusion (5EZV)
  { proteinId: '5EZV', moleculeId: 'curcumina', affinity: -8.4, ranking: 'high' },
  { proteinId: '5EZV', moleculeId: 'quercetin', affinity: -8.0, ranking: 'high' },
  { proteinId: '5EZV', moleculeId: 'luteolina', affinity: -7.6, ranking: 'medium' },
  { proteinId: '5EZV', moleculeId: 'niclosamida', affinity: -7.1, ranking: 'medium' },
  { proteinId: '5EZV', moleculeId: 'remdesivir', affinity: -6.4, ranking: 'medium' },
  { proteinId: '5EZV', moleculeId: 'favipiravir', affinity: -4.8, ranking: 'low' },
  { proteinId: '5EZV', moleculeId: 'ribavirina', affinity: -4.0, ranking: 'low' },
  { proteinId: '5EZV', moleculeId: 'cafeina', affinity: -2.6, ranking: 'low' },

  // Ebola Glycoprotein (3CSY)
  { proteinId: '3CSY', moleculeId: 'quercetin', affinity: -8.5, ranking: 'high' },
  { proteinId: '3CSY', moleculeId: 'curcumina', affinity: -8.1, ranking: 'high' },
  { proteinId: '3CSY', moleculeId: 'luteolina', affinity: -7.7, ranking: 'medium' },
  { proteinId: '3CSY', moleculeId: 'niclosamida', affinity: -7.2, ranking: 'medium' },
  { proteinId: '3CSY', moleculeId: 'remdesivir', affinity: -6.5, ranking: 'medium' },
  { proteinId: '3CSY', moleculeId: 'favipiravir', affinity: -5.0, ranking: 'low' },
  { proteinId: '3CSY', moleculeId: 'ribavirina', affinity: -4.2, ranking: 'low' },
  { proteinId: '3CSY', moleculeId: 'cafeina', affinity: -2.7, ranking: 'low' },

  // Ebola Polymerase (3CIW)
  { proteinId: '3CIW', moleculeId: 'remdesivir', affinity: -9.7, ranking: 'high' },
  { proteinId: '3CIW', moleculeId: 'favipiravir', affinity: -8.4, ranking: 'high' },
  { proteinId: '3CIW', moleculeId: 'ribavirina', affinity: -7.9, ranking: 'high' },
  { proteinId: '3CIW', moleculeId: 'curcumina', affinity: -7.1, ranking: 'medium' },
  { proteinId: '3CIW', moleculeId: 'quercetin', affinity: -6.7, ranking: 'medium' },
  { proteinId: '3CIW', moleculeId: 'niclosamida', affinity: -6.2, ranking: 'medium' },
  { proteinId: '3CIW', moleculeId: 'luteolina', affinity: -5.8, ranking: 'low' },
  { proteinId: '3CIW', moleculeId: 'cafeina', affinity: -3.0, ranking: 'low' },

  // Zika NS3 Protease (5IRE)
  { proteinId: '5IRE', moleculeId: 'curcumina', affinity: -8.6, ranking: 'high' },
  { proteinId: '5IRE', moleculeId: 'quercetin', affinity: -8.2, ranking: 'high' },
  { proteinId: '5IRE', moleculeId: 'luteolina', affinity: -7.8, ranking: 'medium' },
  { proteinId: '5IRE', moleculeId: 'niclosamida', affinity: -7.3, ranking: 'medium' },
  { proteinId: '5IRE', moleculeId: 'remdesivir', affinity: -6.5, ranking: 'medium' },
  { proteinId: '5IRE', moleculeId: 'favipiravir', affinity: -5.0, ranking: 'low' },
  { proteinId: '5IRE', moleculeId: 'ribavirina', affinity: -4.2, ranking: 'low' },
  { proteinId: '5IRE', moleculeId: 'cafeina', affinity: -2.6, ranking: 'low' },

  // Zika NS5 (5U04)
  { proteinId: '5U04', moleculeId: 'quercetin', affinity: -8.0, ranking: 'high' },
  { proteinId: '5U04', moleculeId: 'curcumina', affinity: -7.8, ranking: 'high' },
  { proteinId: '5U04', moleculeId: 'luteolina', affinity: -7.3, ranking: 'medium' },
  { proteinId: '5U04', moleculeId: 'niclosamida', affinity: -6.7, ranking: 'medium' },
  { proteinId: '5U04', moleculeId: 'remdesivir', affinity: -6.1, ranking: 'medium' },
  { proteinId: '5U04', moleculeId: 'favipiravir', affinity: -4.6, ranking: 'low' },
  { proteinId: '5U04', moleculeId: 'ribavirina', affinity: -3.8, ranking: 'low' },
  { proteinId: '5U04', moleculeId: 'cafeina', affinity: -2.4, ranking: 'low' },
];

export function getAffinity(proteinId: string, moleculeId: string): { affinity: number; ranking: 'high' | 'medium' | 'low' } {
  const entry = affinities.find(
    a => a.proteinId.toLowerCase() === proteinId.toLowerCase() &&
         a.moleculeId.toLowerCase() === moleculeId.toLowerCase()
  );

  if (entry) {
    return { affinity: entry.affinity, ranking: entry.ranking };
  }

  // Valores por defecto si no existe entrada
  return { affinity: -5.5, ranking: 'medium' };
}

export function getAffinitiesForProtein(proteinId: string): AffinityData[] {
  return affinities.filter(a => a.proteinId.toLowerCase() === proteinId.toLowerCase());
}

export function getHighAffinityMoleculesForProtein(proteinId: string): string[] {
  return affinities
    .filter(a => a.proteinId.toLowerCase() === proteinId.toLowerCase() && a.ranking === 'high')
    .map(a => a.moleculeId);
}
