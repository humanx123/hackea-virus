// Protein hotspots and interesting domains
// Auto-detected when the selection box gets near them

export interface ProteinHotspot {
  id: string;
  name: string;
  description: string;
  type: 'active-site' | 'domain' | 'motif' | 'interface' | 'regulatory';
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number; // Detection radius in Angstroms
  importance: 'critical' | 'high' | 'moderate' | 'low';
}

export const proteinHotspots: Record<string, ProteinHotspot[]> = {
  // SARS-CoV-2 Spike (6VXX)
  '6VXX': [
    {
      id: 'rbd-core',
      name: 'Núcleo RBD',
      description: 'Región central del dominio de unión a receptor. Contiene residuos clave para el reconocimiento de ACE2. Altamente conservado entre coronavirus.',
      type: 'domain',
      centerX: -5.2,
      centerY: 38.9,
      centerZ: 42.1,
      radius: 12,
      importance: 'critical'
    },
    {
      id: 'n501',
      name: 'Posición N501 (Variante)',
      description: 'Sitio crítico de mutación viral. En variantes como Ómicron, Y501 aumenta afinidad por ACE2. Importante para evolución y escape inmune.',
      type: 'regulatory',
      centerX: -8.1,
      centerY: 41.2,
      centerZ: 44.5,
      radius: 8,
      importance: 'critical'
    },
    {
      id: 'beta-sheet-core',
      description: 'Estructura secundaria de lámina beta. Proporciona estabilidad estructural al RBD.',
      name: 'Lámina β Central',
      type: 'motif',
      centerX: 0,
      centerY: 35,
      centerZ: 40,
      radius: 15,
      importance: 'high'
    },
    {
      id: 'glycan-site',
      name: 'Sitio de Glicosilación',
      description: 'Sitio de modificación post-traducción. Las glicanas camuflan epítopos y protegen la proteína del sistema inmune.',
      type: 'domain',
      centerX: -15,
      centerY: 45,
      centerZ: 35,
      radius: 6,
      importance: 'high'
    }
  ],

  // SARS-CoV-2 Main Protease (6LU7)
  '6LU7': [
    {
      id: 'catalytic-dyad',
      name: 'Diada Catalítica (His41-Cys145)',
      description: 'Centro catalítico donde ocurre la proteólisis. His41 actúa como base y Cys145 como nucleófilo. Blanco de inhibidores como Paxlovid.',
      type: 'active-site',
      centerX: -10.7,
      centerY: 10.5,
      centerZ: -8.2,
      radius: 6,
      importance: 'critical'
    },
    {
      id: 'substrate-pocket-s1',
      name: 'Bolsillo S1',
      description: 'Bolsillo de unión primario. Reconoce residuos P1 del sustrato. Hidrofóbico, preferentemente acepta Gln, Ala, Ser.',
      type: 'domain',
      centerX: -12,
      centerY: 8,
      centerZ: -10,
      radius: 7,
      importance: 'critical'
    },
    {
      id: 'loop-hinge',
      name: 'Bucle Bisagra',
      description: 'Región flexible que sufre cambios conformacionales durante catálisis. Importante para mecanismo enzimático.',
      type: 'motif',
      centerX: -8,
      centerY: 15,
      centerZ: -5,
      radius: 8,
      importance: 'high'
    }
  ],

  // SARS-CoV-2 RNA Polymerase (7BTF)
  '7BTF': [
    {
      id: 'ntp-binding',
      name: 'Sitio de Unión a NTP',
      description: 'Bolsillo donde se unen nucleótidos trifosfato. Metal-dependiente. Sitio donde Remdesivir ejerce su efecto inhibidor.',
      type: 'active-site',
      centerX: -15.2,
      centerY: 22.1,
      centerZ: 18.9,
      radius: 10,
      importance: 'critical'
    },
    {
      id: 'priming-loop',
      name: 'Bucle de Iniciación',
      description: 'Estructura dinámica que facilita la iniciación de síntesis de ARN. Se reposiciona durante catálisis.',
      type: 'motif',
      centerX: -12,
      centerY: 20,
      centerZ: 22,
      radius: 8,
      importance: 'high'
    },
    {
      id: 'template-channel',
      name: 'Canal de Molde',
      description: 'Paso por donde entra el ARN molde a copiar. Estrecho y selectivo. Blanco de moléculas pequeñas inhibidoras.',
      type: 'domain',
      centerX: -8,
      centerY: 18,
      centerZ: 15,
      radius: 10,
      importance: 'high'
    }
  ],

  // Default hotspots for other proteins
  'default': [
    {
      id: 'putative-active-site',
      name: 'Sitio Activo Putativo',
      description: 'Región potencial para catálisis basada en modelado computacional.',
      type: 'active-site',
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      radius: 10,
      importance: 'high'
    },
    {
      id: 'surface-patch',
      name: 'Parche Superficial',
      description: 'Región hidrófoba en la superficie. Potencial sitio de unión.',
      type: 'domain',
      centerX: 20,
      centerY: 20,
      centerZ: 20,
      radius: 8,
      importance: 'moderate'
    }
  ]
};

export function getHotspotsForProtein(pdbId: string): ProteinHotspot[] {
  return proteinHotspots[pdbId] || proteinHotspots['default'];
}

export function findNearbyHotspots(
  pdbId: string,
  centerX: number,
  centerY: number,
  centerZ: number,
  detectionRadius: number
): ProteinHotspot[] {
  const hotspots = getHotspotsForProtein(pdbId);

  return hotspots.filter(hotspot => {
    const dx = hotspot.centerX - centerX;
    const dy = hotspot.centerY - centerY;
    const dz = hotspot.centerZ - centerZ;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return distance <= (hotspot.radius + detectionRadius);
  });
}
