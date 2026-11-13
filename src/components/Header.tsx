import React from 'react';
import { 
  BookHeart, 
  Info, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  Play
} from 'lucide-react';

interface HeaderProps {
  onOpenInfo: (tab?: 'all' | 'intent' | 'journey' | 'rolecard' | 'diagram') => void;
  onOpenBenchmark: () => void;
  onQuickStandardTest: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInfo,
  onOpenBenchmark,
  onQuickStandardTest,
  isLoading = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* App Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs">
            <BookHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200/60">
                Homework Journal – App 3
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Thoughtful Letter Coach
            </h1>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Visible Badge: Role Card applied */}
          <button 
            onClick={() => onOpenInfo('rolecard')}
            className="group cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-2xs hover:bg-emerald-100 transition-colors"
            title="Click to view Role Card system instructions & design intent"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tracking-tight">Role Card applied</span>
          </button>

          {/* Benchmark Results Comparison Button */}
          <button
            onClick={onOpenBenchmark}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors shadow-2xs"
            title="Compare baseline no-Role-Card behavior with Role-Card behavior on Professor Kim prompt"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Benchmark Results</span>
            <span className="sm:hidden">Benchmark</span>
          </button>

          {/* Quick Standard Test trigger button */}
          <button
            onClick={onQuickStandardTest}
            disabled={isLoading}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
            title="Load Professor Kim mentorship thank-you preset"
          >
            <span>Standard Test</span>
          </button>

          {/* Information button (opens System Diagram reliably) */}
          <button
            onClick={() => onOpenInfo('diagram')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open System Diagram & Architecture"
          >
            <Info className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">System Diagram</span>
            <span className="md:hidden">Diagram</span>
          </button>

        </div>

      </div>
    </header>
  );
};
