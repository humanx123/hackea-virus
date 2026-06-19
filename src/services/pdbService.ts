// Service to fetch and parse real PDB structures from RCSB PDB

const PDB_URL_BASE = 'https://files.rcsb.org/download/';

export interface PDBAtom {
  name: string;
  x: number;
  y: number;
  z: number;
  element: string;
  bFactor: number;
}

export interface PDBStructure {
  id: string;
  atoms: PDBAtom[];
  name: string;
  loaded: boolean;
  atomCount: number;
}

async function fetchPDBLocal(pdbId: string): Promise<string | null> {
  try {
    const response = await fetch(`/pdb/${pdbId.toLowerCase()}.pdb`);
    if (response.ok) {
      console.log(`[PDB LOCAL] ✓ Cargado desde archivo local: ${pdbId}`);
      return await response.text();
    }
    return null;
  } catch (err) {
    console.warn(`[PDB LOCAL] No encontrado: ${pdbId}`);
    return null;
  }
}

export async function fetchPDB(pdbId: string): Promise<PDBStructure> {
  try {
    // Intentar cargar desde archivo local primero
    let pdbText = await fetchPDBLocal(pdbId);

    // Si no está disponible localmente, descargar desde RCSB
    if (!pdbText) {
      const url = `${PDB_URL_BASE}${pdbId.toLowerCase()}.pdb`;
      console.log(`[PDB] 📥 Descargando desde RCSB: ${url}`);

      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'text/plain'
        }
      });

      if (!response.ok) {
        console.error(`[PDB ERROR] HTTP ${response.status} para ${pdbId}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      pdbText = await response.text();
      console.log(`[PDB] ✓ Recibido ${pdbText.length} bytes desde RCSB para ${pdbId}`);
    }

    const atoms = parsePDB(pdbText);
    console.log(`[PDB] ✓ Parseado ${atoms.length} átomos de ${pdbId}`);

    return {
      id: pdbId,
      atoms,
      name: pdbId.toUpperCase(),
      loaded: atoms.length > 0,
      atomCount: atoms.length
    };
  } catch (error) {
    console.error(`[PDB ERROR] Fallo cargando ${pdbId}:`, error instanceof Error ? error.message : String(error));
    return {
      id: pdbId,
      atoms: [],
      name: pdbId.toUpperCase(),
      loaded: false,
      atomCount: 0
    };
  }
}

function parsePDB(pdbText: string): PDBAtom[] {
  const atoms: PDBAtom[] = [];
  const lines = pdbText.split('\n');

  let lineCount = 0;
  let validAtoms = 0;
  let parseErrors = 0;

  for (const line of lines) {
    // ATOM records: 6 chars record name, then data starts at column 6
    if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
      lineCount++;
      try {
        // PDB format: columns are 1-indexed in official spec, but we use 0-indexed
        // Columns: 1-6 record, 7-11 serial, 13-16 name, 18-20 residue, 22-26 serial, 31-38 x, 39-46 y, 47-54 z, 61-66 B-factor, 77-78 element
        const x = parseFloat(line.substring(30, 38).trim());
        const y = parseFloat(line.substring(38, 46).trim());
        const z = parseFloat(line.substring(46, 54).trim());
        const element = line.substring(76, 78).trim() || 'C';
        const bFactor = parseFloat(line.substring(60, 66).trim()) || 0;
        const name = line.substring(12, 16).trim();

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          atoms.push({ name, x, y, z, element, bFactor });
          validAtoms++;
        }
      } catch (e) {
        parseErrors++;
        if (parseErrors <= 3) {
          console.warn(`[PDB PARSE] Error línea ${lineCount}: ${line.substring(0, 50)}`);
        }
      }
    }
  }

  if (parseErrors > 0) {
    console.log(`[PDB] ⚠️ ${parseErrors} errores de parsing`);
  }

  console.log(`[PDB STATS] ${lineCount} líneas ATOM, ${validAtoms} átomos válidos`);
  return atoms;
}

// Cache loaded structures
const pdbCache = new Map<string, PDBStructure>();

export async function getPDB(pdbId: string): Promise<PDBStructure> {
  const normalizedId = pdbId.toLowerCase();

  if (pdbCache.has(normalizedId)) {
    const cached = pdbCache.get(normalizedId)!;
    console.log(`[PDB CACHE] HIT para ${normalizedId} (${cached.atomCount} átomos)`);
    return cached;
  }

  console.log(`[PDB CACHE] MISS para ${normalizedId}, cargando...`);
  const structure = await fetchPDB(normalizedId);

  if (structure.loaded && structure.atomCount > 0) {
    pdbCache.set(normalizedId, structure);
    console.log(`[PDB CACHE] Almacenado ${normalizedId} (${structure.atomCount} átomos)`);
  } else {
    console.log(`[PDB] No se pudo cargar ${normalizedId}`);
  }

  return structure;
}
