export type WellId = 'A1' | 'D1' | 'B2' | 'C2' | 'A3' | 'B3' | 'C3' | 'D3';

export type ReagentToolId = 'pipet_fe' | 'pipet_scn' | 'pipet_water' | 'dropper_agno3' | 'scoopula_fe';

export interface WellState {
  id: WellId;
  label: string;
  role: 'stock_fe' | 'stock_scn' | 'conc_mix' | 'dilute_control' | 'test_fe' | 'test_scn' | 'test_agno3' | 'test_solid_fe';
  name: string;
  formula: string;
  volumeMl: number; // in mL
  feConcentrationM: number;
  scnConcentrationM: number;
  feNcsConcentrationM: number;
  agConcentrationM: number;
  hasPrecipitate: boolean;
  precipitateDesc?: string;
  colorHex: string;
  disturbed: boolean;
  disturbanceApplied?: string;
  expectedShift?: '→' | '←' | 'None';
  isControl?: boolean;
}

export type LabTab = 'lab_part_a' | 'lab_part_b' | 'molecular' | 'manual';

export interface LabStep {
  id: number;
  part: 'A' | 'B';
  code: string;
  title: string;
  instructions: string;
  sourceType: 'reagent' | 'well';
  sourceId: ReagentToolId | WellId;
  sourceLabel: string;
  targetWell: WellId;
  targetWellsRemaining?: WellId[]; // For distribution step 2.2
  requiredAction: string;
  dataSheetPrompt: string; // The specific prompt telling the student what to record on their data sheet
  completed: boolean;
  hint: string;
  theoryNote: string;
}
