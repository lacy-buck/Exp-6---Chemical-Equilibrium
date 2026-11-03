import React, { useState } from 'react';
import { WellState, WellId, LabStep, ReagentToolId } from '../types/lab';
import { 
  Droplet, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  Info,
  Check,
  MousePointerClick
} from 'lucide-react';

interface WellplateViewProps {
  wells: Record<WellId, WellState>;
  currentStepIndex: number;
  steps: LabStep[];
  onExecuteStep: (stepId: number) => void;
  onResetWellplate: () => void;
  onSelectWell: (id: WellId) => void;
  selectedWellId: WellId;
}

export const WellplateView: React.FC<WellplateViewProps> = ({
  wells,
  currentStepIndex,
  steps,
  onExecuteStep,
  onResetWellplate,
  onSelectWell,
  selectedWellId,
}) => {
  const [activeHeldTool, setActiveHeldTool] = useState<{
    id: ReagentToolId | WellId;
    label: string;
    type: 'reagent' | 'well';
  } | null>(null);

  const [stepCompleteMessage, setStepCompleteMessage] = useState<string | null>(null);
  const [isTransferringAnim, setIsTransferringAnim] = useState(false);

  const activeStep = steps[currentStepIndex] || null;
  const currentWell = wells[selectedWellId];
  const controlWell = wells['C2'];

  // Handle clicking a reagent bottle/tool in the bottom rack
  const handleReagentClick = (toolId: ReagentToolId, label: string) => {
    if (!activeStep) return;

    if (activeStep.sourceType === 'reagent' && activeStep.sourceId === toolId) {
      setActiveHeldTool({ id: toolId, label, type: 'reagent' });
      setStepCompleteMessage(null);
    } else {
      // User clicked a reagent that is not the current source
      if (activeHeldTool?.id === toolId) {
        // Toggle off
        setActiveHeldTool(null);
      } else {
        setActiveHeldTool({ id: toolId, label, type: 'reagent' });
      }
    }
  };

  // Handle clicking a well on the microplate
  const handleWellClick = (wellId: WellId) => {
    // If a tool is held, check if this well is the target!
    if (activeHeldTool && activeStep) {
      const isTarget =
        activeStep.targetWell === wellId ||
        (activeStep.targetWellsRemaining && activeStep.targetWellsRemaining.includes(wellId));

      if (isTarget) {
        // Successful transfer!
        setIsTransferringAnim(true);
        setTimeout(() => {
          setIsTransferringAnim(false);
          setActiveHeldTool(null);
          onSelectWell(wellId);
          onExecuteStep(activeStep.id);
          setStepCompleteMessage(activeStep.dataSheetPrompt);
        }, 400);
        return;
      }
    }

    // If no tool is held, check if clicking this well acts as the source for the current step!
    if (activeStep && activeStep.sourceType === 'well' && activeStep.sourceId === wellId) {
      setActiveHeldTool({
        id: wellId,
        label: activeStep.sourceLabel,
        type: 'well',
      });
      setStepCompleteMessage(null);
      onSelectWell(wellId);
      return;
    }

    // Default: select the well to inspect it
    onSelectWell(wellId);
  };

  const topColumns = ['A', 'B', 'C', 'D'];
  const sideRows = [1, 2, 3];

  // Helper to determine highlight styles
  const isWellSourceTarget = (id: WellId) => {
    if (!activeStep) return false;
    if (!activeHeldTool && activeStep.sourceType === 'well' && activeStep.sourceId === id) {
      return 'isSource';
    }
    if (
      activeHeldTool &&
      (activeStep.targetWell === id ||
        (activeStep.targetWellsRemaining && activeStep.targetWellsRemaining.includes(id)))
    ) {
      return 'isTarget';
    }
    return false;
  };

  const isReagentSource = (toolId: ReagentToolId) => {
    return !activeHeldTool && activeStep?.sourceType === 'reagent' && activeStep?.sourceId === toolId;
  };

  return (
    <div className="space-y-6">
      {/* Top Interactive Step Guide Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold tracking-wider">
                Part A Procedure · {activeStep ? activeStep.code : 'All Steps Completed'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {activeStep ? activeStep.title : 'All Part A Procedure Steps Complete!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {activeStep
                ? activeStep.instructions
                : 'You have completed all pipetting transfers and disturbances. Review your observations against your data sheet.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Direct Tool Status Indicator */}
            {activeStep && !activeStep.completed && (
              <div
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                  activeHeldTool
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300 animate-pulse'
                }`}
              >
                <MousePointerClick className="w-4 h-4" />
                <span>
                  {activeHeldTool
                    ? `Holding: ${activeHeldTool.label} → Click Target Well!`
                    : `Action: ${activeStep.requiredAction}`}
                </span>
              </div>
            )}

            <button
              onClick={onResetWellplate}
              title="Reset Wellplate"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Plate</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action & Data Sheet Prompt Banner */}
        {activeStep && (
          <div className="mt-4 p-4 rounded-xl border border-amber-300/80 bg-amber-50/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <ClipboardList className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">
                  Instructions for Student Data Sheet:
                </div>
                <div className="text-xs sm:text-sm font-medium mt-0.5 leading-relaxed text-amber-950">
                  {activeStep.dataSheetPrompt}
                </div>
              </div>
            </div>

            {activeStep.completed && currentStepIndex < steps.length - 1 && (
              <button
                onClick={() => {
                  setStepCompleteMessage(null);
                  setActiveHeldTool(null);
                }}
                className="self-end sm:self-center px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue to Step {steps[currentStepIndex + 1]?.code}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Wellplate Grid & Reagent Rack (Transposed Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Micro-Wellplate (Transposed Layout: Columns A–D, Rows 1–3)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click the requested pipets or wells directly to transfer solutions. Look at each well to judge its appearance yourself!
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-amber-500 bg-amber-500/40 inline-block" />
                  C2 = Control
                </span>
              </div>
            </div>

            {/* Wellplate Body */}
            <div className="p-6 bg-slate-100 rounded-2xl border-2 border-slate-300 shadow-inner">
              {/* Columns Header (A, B, C, D) */}
              <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-3 text-center text-xs font-mono font-bold text-slate-700">
                <div className="text-2xs text-slate-400 uppercase font-mono flex items-center justify-center">
                  Wellplate
                </div>
                <div className="py-1 px-2 rounded bg-slate-200/70">Col A</div>
                <div className="py-1 px-2 rounded bg-slate-200/70">Col B</div>
                <div className="py-1 px-2 rounded bg-slate-200/70">Col C</div>
                <div className="py-1 px-2 rounded bg-slate-200/70">Col D</div>
              </div>

              {/* Rows 1, 2, 3 */}
              <div className="space-y-4">
                {sideRows.map((rowNum) => (
                  <div key={rowNum} className="grid grid-cols-5 gap-3 sm:gap-4 items-center">
                    {/* Row Label along left side */}
                    <div className="text-center">
                      <span className="font-mono font-bold text-slate-700 text-xs sm:text-sm block">
                        Row {rowNum}
                      </span>
                      <span className="text-2xs text-slate-400 block mt-0.5">
                        {rowNum === 1 ? 'Stocks' : rowNum === 2 ? 'Mix/Control' : 'Test Wells'}
                      </span>
                    </div>

                    {/* Columns A, B, C, D under this row */}
                    {topColumns.map((colLetter) => {
                      const id = `${colLetter}${rowNum}` as WellId;
                      const well = wells[id];
                      const isDesignated = Boolean(well);
                      const isSelected = selectedWellId === id;
                      const roleStatus = isWellSourceTarget(id);

                      if (!isDesignated) {
                        return (
                          <div
                            key={id}
                            className="w-full aspect-square rounded-full bg-slate-200/40 border border-dashed border-slate-300 flex items-center justify-center text-2xs text-slate-400 font-mono"
                          >
                            {id}
                          </div>
                        );
                      }

                      // Highlighting states for hands-on clicking
                      let borderClass = 'border-slate-300 hover:border-slate-400';
                      let pulseBadge = null;

                      if (roleStatus === 'isSource') {
                        borderClass = 'ring-4 ring-cyan-500 border-cyan-500 animate-pulse scale-105';
                        pulseBadge = 'Click to Draw';
                      } else if (roleStatus === 'isTarget') {
                        borderClass = 'ring-4 ring-amber-500 border-amber-500 animate-bounce scale-105';
                        pulseBadge = 'Click to Dispense';
                      } else if (isSelected) {
                        borderClass = 'ring-3 ring-slate-900 border-slate-900 shadow-md';
                      } else if (id === 'C2' && wells['C2'].volumeMl > 0) {
                        borderClass = 'border-amber-500';
                      }

                      return (
                        <div
                          key={id}
                          onClick={() => handleWellClick(id)}
                          className={`relative group w-full aspect-square rounded-full border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${borderClass}`}
                          style={{
                            background:
                              well.volumeMl > 0
                                ? `radial-gradient(circle at 40% 35%, #ffffff 0%, ${well.colorHex} 70%)`
                                : '#ffffff',
                          }}
                        >
                          {/* Inner meniscus shading */}
                          <div className="absolute inset-1 rounded-full border border-black/10 pointer-events-none shadow-inner" />

                          {/* Precipitate particles if well has AgSCN */}
                          {well.hasPrecipitate && (
                            <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-none flex items-center justify-center">
                              <div className="w-full h-full opacity-80 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:5px_5px]" />
                            </div>
                          )}

                          {/* Interactive Pulse Callout Badge */}
                          {pulseBadge && (
                            <div className="absolute -top-3 z-30 px-1.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-3xs uppercase tracking-wider font-bold shadow-md whitespace-nowrap">
                              {pulseBadge}
                            </div>
                          )}

                          {/* Well Label Badge */}
                          <div className="z-10 text-center px-1">
                            <span
                              className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                                well.volumeMl > 0
                                  ? 'bg-slate-900/85 text-white'
                                  : 'text-slate-600 bg-white/80'
                              }`}
                            >
                              {id}
                            </span>
                            <div className="text-2xs font-semibold text-slate-900 line-clamp-1 mt-0.5 max-w-[65px]">
                              {id === 'C2'
                                ? '★ Control'
                                : id === 'B2'
                                ? 'Conc'
                                : id === 'A1'
                                ? 'Fe³⁺'
                                : id === 'D1'
                                ? 'SCN⁻'
                                : id === 'A3'
                                ? '+Fe³⁺'
                                : id === 'B3'
                                ? '+SCN⁻'
                                : id === 'C3'
                                ? '+AgNO₃'
                                : '+Solid Fe'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Reagents & Pipettes Rack with Hands-on Click Affordance */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Laboratory Reagents & Transfer Pipettes
                </span>
                <span className="text-2xs text-slate-500">
                  Click a pipet or bottle to load it
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Fe3+ Stock Pipet */}
                <button
                  type="button"
                  onClick={() => handleReagentClick('pipet_fe', '0.1 M Fe(NO₃)₃ Pipet')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                    activeHeldTool?.id === 'pipet_fe'
                      ? 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-500'
                      : isReagentSource('pipet_fe')
                      ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-400 animate-pulse'
                      : 'border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70'
                  }`}
                >
                  {isReagentSource('pipet_fe') && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-3xs font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Click Pipet
                    </span>
                  )}
                  <div className="w-6 h-6 mx-auto rounded-full bg-amber-200 border border-amber-300 shadow-2xs mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">0.1 M Fe(NO₃)₃</div>
                  <div className="text-2xs text-slate-500 font-mono">Stock Fe³⁺ Pipet</div>
                </button>

                {/* 2. SCN- Stock Pipet */}
                <button
                  type="button"
                  onClick={() => handleReagentClick('pipet_scn', '0.1 M KSCN Pipet')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                    activeHeldTool?.id === 'pipet_scn'
                      ? 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-500'
                      : isReagentSource('pipet_scn')
                      ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-400 animate-pulse'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {isReagentSource('pipet_scn') && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-3xs font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Click Pipet
                    </span>
                  )}
                  <div className="w-6 h-6 mx-auto rounded-full bg-white border border-slate-300 shadow-2xs mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">0.1 M KSCN</div>
                  <div className="text-2xs text-slate-500 font-mono">Stock SCN⁻ Pipet</div>
                </button>

                {/* 3. DI Water Pipet */}
                <button
                  type="button"
                  onClick={() => handleReagentClick('pipet_water', 'Deionized H₂O Pipet')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                    activeHeldTool?.id === 'pipet_water'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
                      : isReagentSource('pipet_water')
                      ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400 animate-pulse'
                      : 'border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70'
                  }`}
                >
                  {isReagentSource('pipet_water') && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-3xs font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Click Pipet
                    </span>
                  )}
                  <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 border border-blue-200 shadow-2xs mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Deionized H₂O</div>
                  <div className="text-2xs text-slate-500 font-mono">Dilution Pipet</div>
                </button>

                {/* 4. AgNO3 Dropper Bottle */}
                <button
                  type="button"
                  onClick={() => handleReagentClick('dropper_agno3', '0.1 M AgNO₃ Dropper')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                    activeHeldTool?.id === 'dropper_agno3'
                      ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-700'
                      : isReagentSource('dropper_agno3')
                      ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-600 animate-pulse'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {isReagentSource('dropper_agno3') && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-3xs font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Click Dropper
                    </span>
                  )}
                  <div className="w-6 h-6 mx-auto rounded-full bg-slate-200 border border-slate-300 shadow-2xs mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">0.1 M AgNO₃</div>
                  <div className="text-2xs text-slate-500 font-mono">Precipitant Dropper</div>
                </button>

                {/* 5. Solid Fe(NO3)3 Scoopula */}
                <button
                  type="button"
                  onClick={() => handleReagentClick('scoopula_fe', 'Solid Fe(NO₃)₃ Scoopula')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer relative col-span-2 sm:col-span-1 ${
                    activeHeldTool?.id === 'scoopula_fe'
                      ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-500'
                      : isReagentSource('scoopula_fe')
                      ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-400 animate-pulse'
                      : 'border-red-200/80 bg-red-50/70 hover:bg-red-100/70'
                  }`}
                >
                  {isReagentSource('scoopula_fe') && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-700 text-white text-3xs font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Click Scoopula
                    </span>
                  )}
                  <div className="w-6 h-6 mx-auto rounded-full bg-red-400 border border-red-600 shadow-2xs mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Solid Fe(NO₃)₃</div>
                  <div className="text-2xs text-slate-500 font-mono">Scoopula & Stirrer</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Inspector (NO TEXT SPOILERS of colors) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-2xs font-mono uppercase text-slate-400 font-semibold">
                  Visual Well Observation
                </span>
                <h3 className="text-base font-bold text-slate-900">{currentWell.label}</h3>
              </div>
              <div
                className="w-10 h-10 rounded-full border-2 border-slate-300 shadow-xs flex items-center justify-center font-bold font-mono text-xs text-slate-900"
                style={{ backgroundColor: currentWell.colorHex }}
              >
                {selectedWellId}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Visual Appearance Portal (Large Swatch) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-2xs font-mono uppercase text-slate-500 font-semibold mb-2">
                  Sample Appearance Viewport
                </span>

                <div
                  className="w-24 h-24 rounded-full border-4 border-slate-300 shadow-inner relative flex items-center justify-center overflow-hidden transition-all duration-300"
                  style={{
                    background:
                      currentWell.volumeMl > 0
                        ? `radial-gradient(circle at 40% 35%, #ffffff 0%, ${currentWell.colorHex} 70%)`
                        : '#ffffff',
                  }}
                >
                  <div className="absolute inset-1 rounded-full border border-black/10 pointer-events-none" />

                  {/* Precipitate visualization if present */}
                  {currentWell.hasPrecipitate && (
                    <div className="absolute inset-3 rounded-full opacity-80 bg-[radial-gradient(#ffffff_2.5px,transparent_2.5px)] [background-size:6px_6px] pointer-events-none" />
                  )}

                  {currentWell.volumeMl === 0 && (
                    <span className="text-xs font-mono text-slate-400">Empty Well</span>
                  )}
                </div>

                <div className="text-xs text-slate-600 mt-3 max-w-xs leading-relaxed italic">
                  &quot;Observe the color, shade, and any cloudiness with your own eyes, then record your observations in your data sheet.&quot;
                </div>
              </div>

              {/* Chemical Identity & Status */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-2xs uppercase font-mono">Contents / Formula</div>
                  <div className="font-semibold text-slate-900 mt-1 font-mono text-xs line-clamp-1">
                    {currentWell.formula}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-2xs uppercase font-mono">Volume in Well</div>
                  <div className="font-mono font-semibold text-slate-900 mt-1">
                    {currentWell.volumeMl.toFixed(1)} mL
                  </div>
                </div>
              </div>

              {/* Precipitate Notice (Educational note on what to check) */}
              {currentWell.hasPrecipitate && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Cloudiness / Precipitate Formed: </span>
                    Notice the cloudy white appearance in the well resulting from the insoluble AgSCN(s) precipitate.
                  </div>
                </div>
              )}

              {/* Side-by-Side Visual Comparison with Control C2 (NO TEXT SPOILERS) */}
              {selectedWellId !== 'C2' && wells['C2'].volumeMl > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-2xs font-mono uppercase text-slate-500 font-bold mb-2">
                    Direct Visual Comparison with Control Well C2
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <div className="text-2xs text-slate-500 mb-1.5 font-mono font-semibold">
                        Sample Well {selectedWellId}
                      </div>
                      <div
                        className="w-14 h-14 mx-auto rounded-full border-2 border-slate-300 shadow-xs mb-1"
                        style={{
                          background: `radial-gradient(circle at 40% 35%, #ffffff 0%, ${currentWell.colorHex} 70%)`,
                        }}
                      />
                      <span className="text-3xs font-mono text-slate-500 uppercase">Your Sample</span>
                    </div>

                    <div className="text-center">
                      <div className="text-2xs text-slate-500 mb-1.5 font-mono font-semibold">
                        Control Well C2
                      </div>
                      <div
                        className="w-14 h-14 mx-auto rounded-full border-2 border-slate-300 shadow-xs mb-1"
                        style={{
                          background: `radial-gradient(circle at 40% 35%, #ffffff 0%, ${controlWell.colorHex} 70%)`,
                        }}
                      />
                      <span className="text-3xs font-mono text-slate-500 uppercase">Standard Control</span>
                    </div>
                  </div>

                  <p className="text-2xs text-slate-500 mt-2 text-center leading-normal">
                    Compare the two wells visually to decide if your sample is darker or lighter than the control, and record the actual shift on your data sheet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reaction 3 Net Ionic Equation */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-xs">
            <div className="text-2xs font-mono uppercase text-amber-400 font-semibold mb-1">
              Reaction 3 Net Ionic Equation
            </div>
            <div className="text-sm font-mono font-bold text-white mb-2">
              Fe³⁺(aq) + SCN⁻(aq) ⇌ [FeNCS]²⁺(aq)
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed">
              Dynamic chemical equilibrium between iron(III) ions, thiocyanate ions, and the isothiocyanatoiron(III) complex ion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
