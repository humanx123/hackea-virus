export type Screen = 'presentation' | 'start' | 'virusSelect' | 'proteinSelect' | 'moleculeSelect' | 'bindingSiteSelect' | 'docking' | 'results' | 'info';

export interface Molecule {
  id: string;
  name: string;
  category: string;
  molecularWeight: number;
  description: string;
  disclaimer: string;
}

export interface Protein {
  id: string;
  name: string;
  viralFunction: string;
  targetRationale: string;
}

export interface DockingResult {
  moleculeId: string;
  proteinId: string;
  affinity: number; // kcal/mol
  ranking: 'low' | 'medium' | 'high';
  timestamp: Date;
  virusId?: string;
}

export interface GamepadInput {
  aPressed: boolean;
  bPressed: boolean;
  xPressed: boolean;
  yPressed: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  lbPressed: boolean;
  rbPressed: boolean;
  ltValue: number;
  rtValue: number;
  startPressed: boolean;
  selectPressed: boolean;
  gamepadConnected: boolean;
}
