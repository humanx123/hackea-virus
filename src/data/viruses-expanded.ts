export interface ViralProtein {
  id: string;
  name: string;
  function: string;
  pdbId: string;
  description: string;
  importance: string;
}

export interface Virus {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  genus: string;
  type: string;
  genome: string;
  epidemiologicalImportance: string;
  description: string;
  proteins: ViralProtein[];
  deathRate: number;
  affectedPopulation: string;
  discoveryYear: number;
}

export const viruses: Virus[] = [
  {
    id: 'sars-cov-2',
    name: 'SARS-CoV-2',
    scientificName: 'Severe acute respiratory syndrome coronavirus 2',
    family: 'Coronaviridae',
    genus: 'Betacoronavirus',
    type: 'Enveloped',
    genome: 'Positive-sense single-stranded RNA (+ssRNA)',
    epidemiologicalImportance: 'Pandemia COVID-19: 7 millones de muertes (2019-2024), 750 millones infectados',
    description: 'Virus respiratorio causante de COVID-19. Mayor pandemia del siglo XXI.',
    deathRate: 1.5,
    affectedPopulation: '750 millones confirmados, miles de millones expuestos',
    discoveryYear: 2019,
    proteins: [
      {
        id: 'spike',
        name: 'Spike (S)',
        function: 'Reconocimiento de receptor ACE2 y fusión',
        pdbId: '6VXX',
        description: 'Glucoproteína de superficie que media la entrada viral',
        importance: 'Blanco principal de vacunas (mRNA, viral vector)'
      },
      {
        id: 'main-protease',
        name: 'Proteasa Principal (3CLpro/Mpro)',
        function: 'Procesamiento de poliproteína viral',
        pdbId: '6LU7',
        description: 'Enzima esencial para maduración viral',
        importance: 'Blanco de Paxlovid, Nirmatrelvir'
      },
      {
        id: 'rna-polymerase-covid',
        name: 'ARN Polimerasa (RdRp)',
        function: 'Replicación del genoma viral',
        pdbId: '7BTF',
        description: 'Complejo replicativo de ácidos nucleicos',
        importance: 'Blanco de Remdesivir, Molnupiravir'
      },
      {
        id: 'n-protein',
        name: 'Proteína N (Nucleocápside)',
        function: 'Empaquetamiento y protección de ARN',
        pdbId: '6M3M',
        description: 'Proteína estructural de unión a ARN',
        importance: 'Antígeno para pruebas diagnósticas'
      }
    ]
  },
  {
    id: 'influenza-h1n1',
    name: 'Influenzavirus A H1N1',
    scientificName: 'Influenza A virus (A/H1N1)',
    family: 'Orthomyxoviridae',
    genus: 'Influenzavirus',
    type: 'Enveloped',
    genome: 'Negative-sense segmented single-stranded RNA (-ssRNA)',
    epidemiologicalImportance: 'Pandemia 1918 (50-100M), 2009 (250K), gripe estacional anual (1M)',
    description: 'Virus respiratorio causante de gripe. Antígeno variable (drift/shift).',
    deathRate: 0.1,
    affectedPopulation: '1-5 millones anuales (solo grifpe estacional)',
    discoveryYear: 1933,
    proteins: [
      {
        id: 'hemagglutinin',
        name: 'Hemaglutinina (HA)',
        function: 'Unión a receptores de ácido siálico',
        pdbId: '1HGG',
        description: 'Glucoproteína de superficie para adhesión',
        importance: 'Blanco principal de vacunas anuales'
      },
      {
        id: 'neuraminidase',
        name: 'Neuraminidasa (NA)',
        function: 'Escape del virus de células infectadas',
        pdbId: '1NSC',
        description: 'Enzima que remueve receptores virales',
        importance: 'Blanco de Oseltamivir (Tamiflu), Zanamivir'
      },
      {
        id: 'polymerase-complex',
        name: 'Complejo Polimerasa (PB1/PB2/PA)',
        function: 'Transcripción y replicación de ARN',
        pdbId: '4WSB',
        description: 'Heterotrímero de proteínas replicativas',
        importance: 'Blanco de inhibidores experimentales'
      }
    ]
  },
  {
    id: 'hiv-1',
    name: 'VIH-1',
    scientificName: 'Human immunodeficiency virus 1',
    family: 'Retroviridae',
    genus: 'Lentivirus',
    type: 'Enveloped',
    genome: 'Positive-sense single-stranded RNA (+ssRNA), retrovirus',
    epidemiologicalImportance: '40 millones viviendo con VIH, 1 millón muertes/año, 1 millón nuevas infecciones/año',
    description: 'Retrovirus que causa SIDA. Mayor pandemia desde 1981.',
    deathRate: 10,
    affectedPopulation: '40 millones seropositivos, 90+ millones infectados históricamente',
    discoveryYear: 1981,
    proteins: [
      {
        id: 'gp120',
        name: 'gp120',
        function: 'Unión a CD4 y coreceptores',
        pdbId: '2B4C',
        description: 'Glucoproteína de envoltura externa',
        importance: 'Blanco de bNAbs, vacunas preventivas (HVTN 702)'
      },
      {
        id: 'protease-hiv',
        name: 'Proteasa (PR)',
        function: 'Procesamiento de poliproteína',
        pdbId: '1HHP',
        description: 'Aspartato proteasa retroviral',
        importance: 'Blanco de Darunavir, Atazanavir, Ritonavir'
      },
      {
        id: 'reverse-transcriptase',
        name: 'Transcriptasa Inversa (RT)',
        function: 'Síntesis de ADN a partir de ARN',
        pdbId: '1RTD',
        description: 'Enzima característica de retrovirus',
        importance: 'Blanco de AZT, Lamivudina, Efavirenz (TARVs)'
      },
      {
        id: 'integrase',
        name: 'Integrasa (IN)',
        function: 'Integración de ADN viral en genoma',
        pdbId: '1QS4',
        description: 'Enzima de integración cromosómica',
        importance: 'Blanco de Raltegravir, Dolutegravir (INSTIs)'
      }
    ]
  },
  {
    id: 'dengue',
    name: 'Dengue (DENV)',
    scientificName: 'Dengue virus (serotipo 1-4)',
    family: 'Flaviviridae',
    genus: 'Flavivirus',
    type: 'Enveloped',
    genome: 'Positive-sense single-stranded RNA (+ssRNA)',
    epidemiologicalImportance: '400-500 millones infecciones/año, 2.5 mil millones en riesgo, 40,000 muertes/año',
    description: 'Virus transmitido por mosquitos Aedes. Epidemias anuales en trópicos.',
    deathRate: 2.5,
    affectedPopulation: 'Hasta 2.5 mil millones en zonas tropicales',
    discoveryYear: 1780,
    proteins: [
      {
        id: 'envelope-dengue',
        name: 'Proteína E de envoltura',
        function: 'Entrada viral y fusión',
        pdbId: '1OKE',
        description: 'Glucoproteína de superficie tipo II',
        importance: 'Blanco de Dengvaxia, anticuerpos neutralizantes'
      },
      {
        id: 'ns3-dengue',
        name: 'NS3 Proteasa/Helicasa',
        function: 'Procesamiento viral y replicación',
        pdbId: '2FOM',
        description: 'Serina proteasa acoplada a helicasa',
        importance: 'Blanco de inhibidores antivirales (fase ensayo)'
      },
      {
        id: 'ns5-dengue',
        name: 'NS5 ARN Polimerasa (RdRp)',
        function: 'Síntesis de ARN viral',
        pdbId: '4V0Q',
        description: 'Polimerasa ARN dependiente de ARN',
        importance: 'Blanco de análogos de nucleósidos'
      }
    ]
  },
  {
    id: 'measles',
    name: 'Sarampión',
    scientificName: 'Measles virus',
    family: 'Paramyxoviridae',
    genus: 'Morbillivirus',
    type: 'Enveloped',
    genome: 'Negative-sense single-stranded RNA (-ssRNA)',
    epidemiologicalImportance: 'Erradicado en Americas, resurgimiento Europa (baja cobertura vacunal)',
    description: 'Virus altamente contagioso. R0=12-18 (más contagioso que COVID).',
    deathRate: 0.2,
    affectedPopulation: 'Resurgimiento en áreas de baja vacunación',
    discoveryYear: 1954,
    proteins: [
      {
        id: 'h-protein',
        name: 'Proteína H (adhesión)',
        function: 'Unión a CD46 y SLAM',
        pdbId: '5W8R',
        description: 'Glucoproteína que media entrada inicial',
        importance: 'Blanco de anticuerpos neutralizantes (vacuna)'
      },
      {
        id: 'f-protein',
        name: 'Proteína F (fusión)',
        function: 'Fusión de membranas',
        pdbId: '2B8O',
        description: 'Proteína de fusión tipo II',
        importance: 'Blanco de futuros inhibidores'
      }
    ]
  },
  {
    id: 'ebola',
    name: 'Virus del Ébola (EBOV)',
    scientificName: 'Zaire ebolavirus',
    family: 'Filoviridae',
    genus: 'Ebolavirus',
    type: 'Enveloped',
    genome: 'Negative-sense single-stranded RNA (-ssRNA)',
    epidemiologicalImportance: 'Epidemias cíclicas en Africa Occidental. 2014-2016: 11,000 muertes',
    description: 'Virus altamente patogénico. Hemorragia viral severa, tasa mortalidad 50-90%.',
    deathRate: 50,
    affectedPopulation: 'Limitado a brotes en Africa Occidental/Central',
    discoveryYear: 1976,
    proteins: [
      {
        id: 'gp1-ebola',
        name: 'GP1 (glucoproteína de envoltura)',
        function: 'Unión a receptores (TIM-1, PS)',
        pdbId: '3CSY',
        description: 'Proteína de entrada viral',
        importance: 'Blanco de anticuerpos monoclonales (mAbs-114)'
      },
      {
        id: 'vp35',
        name: 'VP35 (proteína de interferencia)',
        function: 'Inhibición de respuesta innata',
        pdbId: '3FKE',
        description: 'Antagonista de interferón',
        importance: 'Blanco terapéutico experimental'
      }
    ]
  },
  {
    id: 'zika',
    name: 'Zika',
    scientificName: 'Zika virus (ZIKV)',
    family: 'Flaviviridae',
    genus: 'Flavivirus',
    type: 'Enveloped',
    genome: 'Positive-sense single-stranded RNA (+ssRNA)',
    epidemiologicalImportance: 'Epidemia 2015-2017: 1.5M infectados, microcefalia congénita, síndrome Guillain-Barré',
    description: 'Virus transmitido por mosquitos. Teratógeno (microcefalia fetal).',
    deathRate: 0.1,
    affectedPopulation: '1.5 millones en Americas 2015-2016',
    discoveryYear: 1947,
    proteins: [
      {
        id: 'envelope-zika',
        name: 'Proteína E',
        function: 'Entrada viral y fusión',
        pdbId: '5IRE',
        description: 'Glucoproteína de superficie',
        importance: 'Blanco de vacunas desarrolladas (fase III)'
      },
      {
        id: 'ns3-zika',
        name: 'NS3 Proteasa',
        function: 'Procesamiento viral',
        pdbId: '5YNO',
        description: 'Serina proteasa',
        importance: 'Blanco de inhibidores'
      }
    ]
  },
  {
    id: 'mpox',
    name: 'Mpox (Viruela del Mono)',
    scientificName: 'Monkeypox virus',
    family: 'Poxviridae',
    genus: 'Orthopoxvirus',
    type: 'Enveloped',
    genome: 'Double-stranded DNA (dsDNA)',
    epidemiologicalImportance: 'Brote pandémico 2022: 140K casos en 70+ países, declino 2023-2024',
    description: 'Virus transmitido por contacto. Lesiones pustulosas características.',
    deathRate: 0.02,
    affectedPopulation: '140,000+ durante pandemia 2022-2023',
    discoveryYear: 1970,
    proteins: [
      {
        id: 'l1-mpox',
        name: 'Proteína L1 (virión)',
        function: 'Estructura viriónica',
        pdbId: '4QED',
        description: 'Proteína estructural mayor',
        importance: 'Blanco de imiquimod, antivirales'
      },
      {
        id: 'a-type-inclusion',
        name: 'Proteína A-type inclusion (ATI)',
        function: 'Inmunoevasión',
        pdbId: '5HAV',
        description: 'Antagonista de respuesta inmune',
        importance: 'Blanco inmunológico'
      }
    ]
  }
];
