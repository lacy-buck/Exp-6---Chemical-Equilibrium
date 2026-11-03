import React from 'react';
import { LabTab } from '../types/lab';
import { Beaker, Flame, Atom, BookOpen, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: LabTab;
  onTabChange: (tab: LabTab) => void;
  completedStepsCount: number;
  totalStepsCount: number;
  onResetLab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  completedStepsCount,
  totalStepsCount,
  onResetLab,
}) => {
  const percentComplete = Math.round((completedStepsCount / totalStepsCount) * 100);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              <Beaker className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                ChemLabs · Experiment 6
              </span>
              <p className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
                Chemical Equilibrium & Le Châtelier’s Principle
              </p>
            </div>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1.5 font-medium text-sm">
            <button
              onClick={() => onTabChange('lab_part_a')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'lab_part_a'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Beaker className="w-4 h-4 text-amber-600" />
              <span>Part A: Wellplate</span>
            </button>

            <button
              onClick={() => onTabChange('lab_part_b')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'lab_part_b'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-4 h-4 text-blue-600" />
              <span>Part B: Temperature</span>
            </button>

            <button
              onClick={() => onTabChange('molecular')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'molecular'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Atom className="w-4 h-4 text-purple-600" />
              <span>Submicroscopic View (Optional)</span>
            </button>

            <button
              onClick={() => onTabChange('manual')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>Lab Manual PDF</span>
            </button>
          </nav>

          {/* Zone 3: Progress & Reset action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">Part A Progress</span>
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                {percentComplete}%
              </span>
              <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            <button
              onClick={onResetLab}
              title="Reset Virtual Workbench"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 overflow-x-auto px-4 py-2 flex items-center gap-2 text-xs">
        <button
          onClick={() => onTabChange('lab_part_a')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'lab_part_a' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Part A: Wellplate
        </button>
        <button
          onClick={() => onTabChange('lab_part_b')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'lab_part_b' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Part B: Thermal
        </button>
        <button
          onClick={() => onTabChange('molecular')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'molecular' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Submicroscopic (Optional)
        </button>
        <button
          onClick={() => onTabChange('manual')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'manual' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Lab Manual
        </button>
      </div>
    </header>
  );
};
