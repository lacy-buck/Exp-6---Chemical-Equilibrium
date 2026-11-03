import React, { useState } from 'react';
import { WellId, WellState, LabTab, LabStep } from './types/lab';
import { INITIAL_WELLS, LAB_STEPS } from './data/labConstants';
import { Header } from './components/Header';
import { WellplateView } from './components/WellplateView';
import { ThermalView } from './components/ThermalView';
import { MolecularInspector } from './components/MolecularInspector';
import { ManualViewer } from './components/ManualViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<LabTab>('lab_part_a');
  const [wells, setWells] = useState<Record<WellId, WellState>>(INITIAL_WELLS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<LabStep[]>(LAB_STEPS);
  const [selectedWellId, setSelectedWellId] = useState<WellId>('A1');

  const completedStepsCount = steps.filter((s) => s.completed).length;

  const handleExecuteStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: true } : s))
    );

    setWells((prev) => {
      const next = { ...prev };

      if (stepId === 1) {
        // Step 1.1: Well A1
        next.A1 = {
          ...next.A1,
          volumeMl: 1.0,
          feConcentrationM: 0.1,
          colorHex: '#fef08a',
        };
        setSelectedWellId('A1');
      } else if (stepId === 2) {
        // Step 1.2: Well D1
        next.D1 = {
          ...next.D1,
          volumeMl: 1.0,
          scnConcentrationM: 0.1,
          colorHex: '#f8fafc',
        };
        setSelectedWellId('D1');
      } else if (stepId === 3) {
        // Step 1.3: Transfer 5 drops Fe3+ from A1 to B2
        next.B2 = {
          ...next.B2,
          volumeMl: 0.25,
          feConcentrationM: 0.1,
          colorHex: '#fef08a',
        };
        setSelectedWellId('B2');
      } else if (stepId === 4) {
        // Step 1.4: Transfer 5 drops SCN- from D1 into B2 -> instant reaction!
        next.B2 = {
          ...next.B2,
          volumeMl: 0.5,
          feConcentrationM: 0.04,
          scnConcentrationM: 0.04,
          feNcsConcentrationM: 0.015,
          colorHex: '#7f1d1d',
        };
        setSelectedWellId('B2');
      } else if (stepId === 5) {
        // Step 2.1a: Transfer 2 drops from B2 to C2
        next.C2 = {
          ...next.C2,
          volumeMl: 0.1,
          feConcentrationM: 0.04,
          scnConcentrationM: 0.04,
          feNcsConcentrationM: 0.015,
          colorHex: '#7f1d1d',
        };
        setSelectedWellId('C2');
      } else if (stepId === 6) {
        // Step 2.1b: Add 3 mL DI H2O to C2 -> Dilute CONTROL solution!
        next.C2 = {
          ...next.C2,
          volumeMl: 3.1,
          feConcentrationM: 0.002,
          scnConcentrationM: 0.002,
          feNcsConcentrationM: 0.0008,
          colorHex: '#ea580c',
          isControl: true,
        };
        setSelectedWellId('C2');
      } else if (stepId === 7) {
        // Step 2.2: Wells A3, B3, C3, D3 receive dilute control solution
        const controlSpecs = {
          volumeMl: 0.5,
          feConcentrationM: 0.002,
          scnConcentrationM: 0.002,
          feNcsConcentrationM: 0.0008,
          colorHex: '#ea580c',
          disturbed: false,
        };
        next.A3 = { ...next.A3, ...controlSpecs };
        next.B3 = { ...next.B3, ...controlSpecs };
        next.C3 = { ...next.C3, ...controlSpecs };
        next.D3 = { ...next.D3, ...controlSpecs };
        setSelectedWellId('A3');
      } else if (stepId === 8) {
        // Step 3.1: Well A3 (+ Fe3+)
        next.A3 = {
          ...next.A3,
          volumeMl: 0.75,
          feConcentrationM: 0.035,
          feNcsConcentrationM: 0.0014,
          colorHex: '#c2410c',
          disturbed: true,
          disturbanceApplied: 'Added 5 drops 0.1 M Fe³⁺',
          expectedShift: '→',
        };
        setSelectedWellId('A3');
      } else if (stepId === 9) {
        // Step 3.2: Well B3 (+ SCN-)
        next.B3 = {
          ...next.B3,
          volumeMl: 0.75,
          scnConcentrationM: 0.035,
          feNcsConcentrationM: 0.0014,
          colorHex: '#c2410c',
          disturbed: true,
          disturbanceApplied: 'Added 5 drops 0.1 M SCN⁻',
          expectedShift: '→',
        };
        setSelectedWellId('B3');
      } else if (stepId === 10) {
        // Step 3.3: Well C3 (+ AgNO3)
        next.C3 = {
          ...next.C3,
          volumeMl: 1.0,
          hasPrecipitate: true,
          precipitateDesc: 'White cloudy AgSCN (s)',
          scnConcentrationM: 0.00005,
          feNcsConcentrationM: 0.0001,
          colorHex: '#fef08a',
          disturbed: true,
          disturbanceApplied: 'Added 10 drops 0.1 M AgNO₃',
          expectedShift: '←',
        };
        setSelectedWellId('C3');
      } else if (stepId === 11) {
        // Step 3.4: Well D3 (+ Solid Fe(NO3)3)
        next.D3 = {
          ...next.D3,
          volumeMl: 0.5,
          feConcentrationM: 0.15,
          feNcsConcentrationM: 0.0038,
          colorHex: '#450a0a',
          disturbed: true,
          disturbanceApplied: 'Added solid Fe(NO₃)₃ granules',
          expectedShift: '→',
        };
        setSelectedWellId('D3');
      }

      return next;
    });

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleResetLab = () => {
    setWells(INITIAL_WELLS);
    setCurrentStepIndex(0);
    setSteps(LAB_STEPS.map((s) => ({ ...s, completed: false })));
    setSelectedWellId('A1');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        completedStepsCount={completedStepsCount}
        totalStepsCount={steps.length}
        onResetLab={handleResetLab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'lab_part_a' && (
          <WellplateView
            wells={wells}
            currentStepIndex={currentStepIndex}
            steps={steps}
            onExecuteStep={handleExecuteStep}
            onResetWellplate={handleResetLab}
            onSelectWell={setSelectedWellId}
            selectedWellId={selectedWellId}
          />
        )}

        {activeTab === 'lab_part_b' && <ThermalView />}

        {activeTab === 'molecular' && <MolecularInspector />}

        {activeTab === 'manual' && <ManualViewer />}
      </main>

      {/* Clean Scientific Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Experiment 6: Demonstrating Chemical Equilibrium Using Le Châtelier’s Principle</span>
            <span className="mx-2">·</span>
            <span>General Chemistry Virtual Lab Series</span>
          </div>
          <div className="flex items-center gap-4 text-2xs font-mono text-slate-400">
            <span>Reference: B101_Lab_Manual</span>
            <span>Submicroscopic View is Optional</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
