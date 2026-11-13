import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Play, FileText, ShieldAlert } from 'lucide-react';
import { LetterContext } from '../types';

export const STANDARD_TEST_DATA: LetterContext = {
  letterType: 'Thank-You / Mentorship',
  recipient: 'Professor Kim',
  relationship: 'Faculty mentor and thesis/project advisor',
  purpose: 'thank-you for mentorship',
  concreteDetails: 'weekly feedback on my prototype',
  tone: 'warm professional',
  boundaries: 'Strictly focus on appreciation for her guidance and feedback; do not invent grades, job offers, or personal travel promises.',
  targetLength: 'a 150-word letter',
  preserveVoice: true,
};

interface StandardTestCardProps {
  onLoadAndRun: (testData: LetterContext) => void;
  onFillOnly: (testData: LetterContext) => void;
  isLoading?: boolean;
}

export const StandardTestCard: React.FC<StandardTestCardProps> = ({
  onLoadAndRun,
  onFillOnly,
  isLoading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-4 shadow-sm transition-all hover:shadow-md">
      
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Standard Test Benchmark</span>
        </div>
        <span className="text-[11px] font-mono text-amber-800/80 font-medium bg-white/70 px-2 py-0.5 rounded border border-amber-200/50">
          Evaluator Preset
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-3">
        Evaluates the coach's ability to craft a 150-word letter anchored strictly on provided facts without hallucinating unshared details.
      </p>

      {/* Prefilled Fields Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/85 p-3 rounded-xl border border-amber-200/70 mb-3.5">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recipient</span>
          <span className="font-semibold text-slate-800">Professor Kim</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purpose</span>
          <span className="font-semibold text-slate-800">thank-you for mentorship</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Concrete Detail</span>
          <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
            weekly feedback on my prototype
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tone & Length</span>
          <span className="font-semibold text-slate-800">
            warm but professional <span className="text-slate-400 font-normal">• 150-word letter</span>
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          onClick={() => onLoadAndRun(STANDARD_TEST_DATA)}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          <span>Run Standard Test (Draft Now)</span>
        </button>

        <button
          onClick={() => onFillOnly(STANDARD_TEST_DATA)}
          disabled={isLoading}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 transition-colors disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Load Form Only</span>
        </button>
      </div>

      {/* Guardrail Note */}
      <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] text-amber-900/80">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Verifies: zero invented memories + exact 150-word length target.</span>
      </div>

    </div>
  );
};
