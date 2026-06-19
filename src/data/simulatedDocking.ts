import type { DockingResult } from '../types';
import { getAffinity } from './affinities';
import { getBindingSite } from './bindingSites';

type RankingType = 'low' | 'medium' | 'high';

function getAffinityRanking(affinity: number): RankingType {
  if (affinity < -8.0) return 'high';
  if (affinity < -6.5) return 'medium';
  return 'low';
}

export async function simulateDocking(
  moleculeId: string,
  proteinId: string,
  bindingSiteId?: string
): Promise<DockingResult> {
  // Simulate docking with realistic timing (8-15 seconds)
  const duration = Math.random() * 7000 + 8000;
  await new Promise(resolve => setTimeout(resolve, duration));

  // Get affinity from the real affinity table
  const { affinity: baseAffinity } = getAffinity(proteinId, moleculeId);

  // Apply binding site bonus if specified
  let affinity = baseAffinity;
  let siteBonus = 0;

  if (bindingSiteId) {
    const site = getBindingSite(proteinId, bindingSiteId);
    if (site) {
      siteBonus = site.affinity_bonus;
      // Apply bonus (more negative = better)
      affinity = baseAffinity - siteBonus;
      console.log(`[DOCKING] Sitio: ${site.name} (bonus: -${siteBonus.toFixed(1)} kcal/mol)`);
    }
  }

  // Add small random variation (±0.4) to simulate minor docking variations
  affinity += (Math.random() - 0.5) * 0.8;

  const ranking = getAffinityRanking(affinity);

  console.log(`[DOCKING] ${moleculeId} + ${proteinId} en ${bindingSiteId}: ${affinity.toFixed(1)} kcal/mol (${ranking})`);

  return {
    moleculeId,
    proteinId,
    affinity: Math.round(affinity * 10) / 10,
    ranking,
    timestamp: new Date(),
  };
}

export function getAffinityDescription(affinity: number, ranking: RankingType): string {
  if (ranking === 'high') {
    return `Afinidad predicha FAVORABLE (${affinity} kcal/mol). Candidato de alto interés para estudios in vitro.`;
  } else if (ranking === 'medium') {
    return `Afinidad predicha MODERADA (${affinity} kcal/mol). Requeriría ensayos de validación para evaluar bioactividad.`;
  } else {
    return `Afinidad predicha DÉBIL (${affinity} kcal/mol). Baja probabilidad de actividad biológica relevante.`;
  }
}
