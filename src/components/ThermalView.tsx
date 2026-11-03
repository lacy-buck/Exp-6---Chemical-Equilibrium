import React, { useState } from 'react';
import { Flame, Snowflake, Thermometer, Info, ClipboardList } from 'lucide-react';

export const ThermalView: React.FC = () => {
  // Continuous temperature simulator (default at room temp 21°C)
  const [temperatureC, setTemperatureC] = useState<number>(21);
  const [selectedPreset, setSelectedPreset] = useState<'ice' | 'room' | 'warm'>('room');

  // Thermodynamic modeling of Cobalt equilibrium:
  // [Co(H2O)6]2+ (pink) + 4Cl- + heat ⇌ [CoCl4]2- (blue) + 6H2O
  const blueFraction = 1 / (1 + Math.exp(-(temperatureC - 35) / 9));
  const pinkFraction = 1 - blueFraction;

  // Color calculation: interpolate between Rosy Pink (#ec4899) and Royal Cobalt Blue (#1d4ed8)
  const rVal = Math.round(244 * pinkFraction + 29 * blueFraction);
  const gVal = Math.round(114 * pinkFraction + 78 * blueFraction);
  const bVal = Math.round(182 * pinkFraction + 216 * blueFraction);
  const dynamicColorRgb = `rgb(${rVal}, ${gVal}, ${bVal})`;

  const setPreset = (preset: 'ice' | 'room' | 'warm') => {
    setSelectedPreset(preset);
    if (preset === 'ice') setTemperatureC(0);
    if (preset === 'room') setTemperatureC(21);
    if (preset === 'warm') setTemperatureC(68);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold tracking-wider">
                Part B: Pink Reactant ⇌ Blue Product
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Demonstration: Effect of Temperature on Chemical Equilibrium
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-0.5">
              The instructor demonstrates the effect of temperature using three equilibrium samples. Observe the color at each temperature and record your observations on your data sheet.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPreset('ice')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                selectedPreset === 'ice' && temperatureC === 0
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-blue-500" />
              <span>Ice Bath (0°C)</span>
            </button>

            <button
              onClick={() => setPreset('room')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                selectedPreset === 'room' && temperatureC === 21
                  ? 'bg-purple-50 border-purple-300 text-purple-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 text-purple-500" />
              <span>Room Temp (21°C)</span>
            </button>

            <button
              onClick={() => setPreset('warm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                selectedPreset === 'warm' && temperatureC === 68
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Warm Bath (68°C)</span>
            </button>
          </div>
        </div>

        {/* Data Sheet Prompt */}
        <div className="mt-4 p-4 rounded-xl border border-amber-300/80 bg-amber-50/80 text-amber-950 flex items-start gap-3">
          <ClipboardList className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold uppercase tracking-wider text-amber-900 font-mono block">
              Action for Student Data Sheet:
            </span>
            <p className="mt-0.5 leading-relaxed">
              Record the observed color in each of the three Part B boxes on your data sheet: (1) <strong>Color when cooled</strong>, (2) <strong>Color at room temperature</strong>, and (3) <strong>Color when warmed</strong>. You will use these findings to determine whether the reaction is endothermic or exothermic for your homework.
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Lab Samples Bench Display (Matching Manual Page 5 & 6) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          The Three Temperature Demonstration Samples (Manual Part B)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample 1: Cooled in Ice Bath */}
          <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/30 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-4">
              <Snowflake className="w-4 h-4 text-blue-600" />
              <span>Sample 1: Cooled in Ice Bath (0°C)</span>
            </div>

            {/* Test Tube Illustration */}
            <div className="relative w-16 h-48 bg-slate-200/60 rounded-b-full border-2 border-slate-300 shadow-inner flex flex-col justify-end p-1.5 overflow-hidden">
              <div
                className="w-full h-3/4 rounded-b-full transition-all duration-500 shadow-md"
                style={{ backgroundColor: '#f472b6' }}
              />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-xs font-semibold text-slate-800">Cooled Sample (0°C)</div>
              <div className="text-2xs text-slate-500 italic">
                Observe the color in the tube and record in your Part B table
              </div>
            </div>
          </div>

          {/* Sample 2: Room Temperature */}
          <div className="p-6 rounded-xl border border-purple-200 bg-purple-50/30 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-4">
              <Thermometer className="w-4 h-4 text-purple-600" />
              <span>Sample 2: Room Temperature (21°C)</span>
            </div>

            {/* Test Tube */}
            <div className="relative w-16 h-48 bg-slate-200/60 rounded-b-full border-2 border-slate-300 shadow-inner flex flex-col justify-end p-1.5 overflow-hidden">
              <div
                className="w-full h-3/4 rounded-b-full transition-all duration-500 shadow-md"
                style={{ backgroundColor: '#a855f7' }}
              />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-xs font-semibold text-slate-800">Ambient Sample (21°C)</div>
              <div className="text-2xs text-slate-500 italic">
                Observe the color in the tube and record in your Part B table
              </div>
            </div>
          </div>

          {/* Sample 3: Heated in Warm Water Bath */}
          <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/30 text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-4">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Sample 3: Heated in Warm Bath (68°C)</span>
            </div>

            {/* Test Tube */}
            <div className="relative w-16 h-48 bg-slate-200/60 rounded-b-full border-2 border-slate-300 shadow-inner flex flex-col justify-end p-1.5 overflow-hidden">
              <div
                className="w-full h-3/4 rounded-b-full transition-all duration-500 shadow-md"
                style={{ backgroundColor: '#1d4ed8' }}
              />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-xs font-semibold text-slate-800">Warmed Sample (68°C)</div>
              <div className="text-2xs text-slate-500 italic">
                Observe the color in the tube and record in your Part B table
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Continuous Temperature Slider Sandbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Continuous Temperature Sandbox (Interactive Exploration)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Slide through temperatures to observe how the color continuously responds across the full thermal range.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-slate-100 text-slate-800">
            Current: {temperatureC}°C ({((temperatureC * 9) / 5 + 32).toFixed(0)}°F)
          </span>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-2xs font-mono text-slate-500">
            <span>0°C (Ice Bath)</span>
            <span>21°C (Room Temp)</span>
            <span>45°C</span>
            <span>68°C (Warm Bath)</span>
            <span>90°C (Hot)</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="1"
            value={temperatureC}
            onChange={(e) => setTemperatureC(Number(e.target.value))}
            className="w-full h-2.5 bg-gradient-to-r from-blue-300 via-purple-300 to-rose-400 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Resulting Solution Appearance at {temperatureC}°C:
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border border-slate-300 shadow-xs"
              style={{ backgroundColor: dynamicColorRgb }}
            />
            <span className="text-xs text-slate-500 font-mono italic">
              [Visual Color Swatch]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
