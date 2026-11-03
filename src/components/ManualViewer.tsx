import React, { useState } from 'react';
import { BookOpen, ShieldAlert, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export const ManualViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'reader' | 'pdf'>('reader');

  return (
    <div className="space-y-6">
      {/* Top Section Nav */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold tracking-wider">
                Lab Documentation
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              B101 Experiment 6 Lab Manual & Reference
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source text from official lab manual: Demonstrating Chemical Equilibrium Using Le Châtelier’s Principle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('reader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === 'reader'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Interactive Guide
            </button>
            <button
              onClick={() => setActiveSection('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'pdf'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Original PDF Document</span>
            </button>
          </div>
        </div>
      </div>

      {activeSection === 'pdf' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-slate-500">
            <span>Viewing: B101_Lab_Manual_8625fd06.pdf</span>
            <a
              href={`${import.meta.env.BASE_URL}assets/aistudio/B101_Lab_Manual_8625fd06.pdf`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Open in new window</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="w-full h-[750px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <iframe
              src={`${import.meta.env.BASE_URL}assets/aistudio/B101_Lab_Manual_8625fd06.pdf`}
              title="Experiment 6 Lab Manual PDF"
              className="w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Article (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Introduction Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Core Concepts & Theory (Pages 43–44)
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>
                  When we begin to study chemical reactions, we often assume that reactions proceed completely to completion until the limiting reagent is exhausted (e.g. HCl + NaOH → NaCl + H₂O).
                </p>
                <p>
                  However, many reactions stop before reaching completion. The forward reaction forms products while simultaneously a reverse reaction re-forms reactants. When both rates become equal, the system reaches <strong>dynamic equilibrium</strong>.
                </p>

                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-2xs space-y-1">
                  <div className="text-amber-400 font-bold">Overall Molecular Equation:</div>
                  <div>Fe(NO₃)₃(aq) + KSCN(aq) ⇌ [FeNCS]²⁺(aq) + 3KNO₃(aq) [Rxn 2]</div>
                  <div className="text-amber-400 font-bold pt-1.5">Net Ionic Equation:</div>
                  <div>Fe³⁺(aq) + SCN⁻(aq) ⇌ [FeNCS]²⁺(aq) [Rxn 3]</div>
                </div>

                <p>
                  Notice that the nitrate (NO₃⁻) and potassium (K⁺) ions are spectators. The thiocyanate ion flips end-for-end so the nitrogen end bonds to Fe³⁺, forming the complex ion <strong>isothiocyanatoiron (III)</strong>.
                </p>
              </div>
            </div>

            {/* Le Chatelier Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Le Châtelier’s Principle & Disturbances
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <blockquote className="p-3 bg-amber-50/60 border-l-2 border-amber-600 rounded text-amber-950 font-medium">
                  &quot;When a system at equilibrium is stressed by a disturbance (such as changing concentration or temperature), the system will adjust in order to relieve the stress and establish a new position of equilibrium.&quot;
                </blockquote>
                <p>
                  If reactant concentration is increased (+Fe³⁺ or +SCN⁻), the system consumes it by shifting <strong>RIGHT (→)</strong>, producing more orange-red [FeNCS]²⁺.
                </p>
                <p>
                  If a reactant is removed (e.g. adding Ag⁺ which precipitates SCN⁻ into white AgSCN), the system restores it by shifting <strong>LEFT (←)</strong>, decomposing [FeNCS]²⁺ and bleaching the orange-red color.
                </p>
              </div>
            </div>

            {/* Temperature Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Part B: Temperature as a Stress (Page 45)
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>
                  In Part B, we consider heat energy. Heat can be treated as a product in an exothermic reaction (Rxn 4a) or as a reactant in an endothermic reaction (Rxn 4b):
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-2xs space-y-1">
                  <div>Pink Reactant ⇌ Blue Product + heat [Rxn 4a: Exothermic]</div>
                  <div>Pink Reactant + heat ⇌ Blue Product [Rxn 4b: Endothermic]</div>
                </div>
                <p>
                  Because warming the solution produces a deep royal blue color, adding heat shifts the equilibrium to the right. Therefore, heat is a reactant, proving the reaction is <strong>Endothermic (Reaction 4b)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Safety Notes & Cleaning (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Safety Notes (Manual Page 45)</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-3 list-disc list-inside">
                <li>
                  <strong>Wear goggles at all times</strong> in the laboratory.
                </li>
                <li>
                  Concentrated hydrochloric acid (HCl) is a strong acid that is irritating to skin. Avoid breathing vapors. In case of contact, wash with plenty of water.
                </li>
                <li>
                  The &quot;Blue Product&quot; in part B is a solution of [CoCl₄]²⁻ prepared using concentrated HCl. If spilled on skin or clothing, rinse thoroughly.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider">
                Cleaning Up & Protocol
              </div>
              <p className="text-slate-600">
                1. Flush all solutions down the drain with plenty of water.
              </p>
              <p className="text-slate-600">
                2. Rinse well plates thoroughly with tap water, then twice with deionized water.
              </p>
              <p className="text-slate-600">
                3. Return each labeled pipet to its designated test tube.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
