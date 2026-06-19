// Real ligands/small molecules with actual PDB ligand IDs

export interface Ligand {
  id: string;
  pdbCode: string;
  name: string;
  formula: string;
  molecularWeight: number;
  source: string;
}

export const ligandDatabase: Record<string, Ligand> = {
  quercetin: {
    id: 'quercetin',
    pdbCode: 'QUE',
    name: 'Quercetina',
    formula: 'C₁₅H₁₀O₇',
    molecularWeight: 302.2,
    source: 'Flavonoide natural (plantas, frutas)'
  },
  curcumin: {
    id: 'curcumin',
    pdbCode: 'CUR',
    name: 'Curcumina',
    formula: 'C₂₁H₂₀O₆',
    molecularWeight: 368.4,
    source: 'Polifenol (Curcuma longa - cúrcuma)'
  },
  remdesivir: {
    id: 'remdesivir',
    pdbCode: 'GS5734',
    name: 'Remdesivir (Veklury)',
    formula: 'C₂₇H₃₅N₆O₈P',
    molecularWeight: 602.6,
    source: 'Nucleótido análogo sintético (antiviral)'
  },
  favipiravir: {
    id: 'favipiravir',
    pdbCode: 'T705',
    name: 'Favipiravir (Avigan)',
    formula: 'C₅H₄FN₃O₂',
    molecularWeight: 157.1,
    source: 'Inhibidor polimerasa sintético'
  },
  ribavirin: {
    id: 'ribavirin',
    pdbCode: 'RBV',
    name: 'Ribavirina',
    formula: 'C₈H₁₂N₄O₅',
    molecularWeight: 244.2,
    source: 'Nucleósido análogo sintético'
  },
  niclosamide: {
    id: 'niclosamide',
    pdbCode: 'NCL',
    name: 'Niclosamida',
    formula: 'C₁₃H₁₀Cl₂N₂O₄',
    molecularWeight: 327.1,
    source: 'Antihelmíntico (Yomesan) - reposicionado'
  },
  luteolin: {
    id: 'luteolin',
    pdbCode: 'LUT',
    name: 'Luteolina',
    formula: 'C₁₅H₁₀O₆',
    molecularWeight: 286.2,
    source: 'Flavona natural (plantas)'
  },
  caffeine: {
    id: 'caffeine',
    pdbCode: 'CAF',
    name: 'Cafeína',
    formula: 'C₈H₁₀N₄O₂',
    molecularWeight: 194.2,
    source: 'Alcaloide natural (café, té) - CONTROL'
  }
};

export function getLigand(moleculeId: string): Ligand | undefined {
  return ligandDatabase[moleculeId];
}
