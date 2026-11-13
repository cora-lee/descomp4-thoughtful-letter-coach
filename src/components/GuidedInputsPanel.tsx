import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Target, 
  Sparkles, 
  ShieldAlert, 
  Sliders, 
  HelpCircle, 
  Check, 
  RotateCcw, 
  SendHorizontal,
  Lightbulb,
  Heart,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { LetterContext } from '../types';
import { StandardTestCard } from './StandardTestCard';

export const PRESET_TONES = [
  'warm professional',
  'formal',
  'friendly',
  'heartfelt',
  'concise',
];

export const LETTER_TYPES = [
  'Thank-You / Mentorship',
  'Gratitude / Appreciation',
  'Apology & Accountability',
  'Boundary & Difficult Conversation',
  'Recommendation / Reference',
  'Personal Note / Keeping in Touch',
  'Farewell & Transition',
  'Custom Letter',
];

interface GuidedInputsPanelProps {
  context: LetterContext;
  onChange: (updated: Partial<LetterContext>) => void;
  onRunDraft: (overrideContext?: LetterContext) => void;
  onAskReflection: () => void;
  onReset: () => void;
  isLoading: boolean;
  highlightMissingTriggered?: boolean;
}

export const GuidedInputsPanel: React.FC<GuidedInputsPanelProps> = ({
  context,
  onChange,
  onRunDraft,
  onAskReflection,
  onReset,
  isLoading,
  highlightMissingTriggered = false,
}) => {
  // Pre-draft intake validation: strictly 6 required fields
  const hasRecipient = context.recipient.trim().length > 0;
  const hasPurpose = context.purpose.trim().length > 0;
  const hasRelationship = context.relationship.trim().length > 0;
  const hasDetails = context.concreteDetails.trim().length > 0;
  const hasTone = context.tone.trim().length > 0;
  const hasBoundaries = context.boundaries.trim().length > 0;

  const intakeChecklist = [
    { key: 'recipient', label: 'Recipient', isDone: hasRecipient },
    { key: 'purpose', label: 'Purpose', isDone: hasPurpose },
    { key: 'relationship', label: 'Relationship', isDone: hasRelationship },
    { key: 'concreteDetails', label: 'Concrete Memory / Detail', isDone: hasDetails },
    { key: 'tone', label: 'Desired Tone', isDone: hasTone },
    { key: 'boundaries', label: 'Boundaries / Off-Limits', isDone: hasBoundaries },
  ];

  const completedCount = intakeChecklist.filter((item) => item.isDone).length;
  const isAllComplete = completedCount === 6;

  const handleDraftClick = () => {
    if (isAllComplete) {
      onRunDraft();
    } else {
      // Guide reflection with max 2 clarifying questions
      onAskReflection();
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Standard Test Card Component */}
      <StandardTestCard
        onLoadAndRun={(testData) => {
          onChange(testData);
          onRunDraft(testData);
        }}
        onFillOnly={(testData) => {
          onChange(testData);
        }}
        isLoading={isLoading}
      />

      {/* Main Guided Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5">
        
        {/* Form Title & Pre-Draft Intake Status */}
        <div className="pb-3 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                <span>Pre-Draft Intake</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                  isAllComplete
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {completedCount}/6 Required Fields
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All 6 items are required before drafting to ensure zero invented facts.
              </p>
            </div>

            {/* Visual mini-meter */}
            <div className="flex items-center space-x-1">
              {intakeChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-2 rounded-sm transition-all ${
                    item.isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  title={`${item.label}: ${item.isDone ? 'Provided' : 'Missing'}`}
                />
              ))}
            </div>
          </div>

          {/* Checklist pills showing missing vs filled fields */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {intakeChecklist.map((item) => (
              <span
                key={item.key}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                  item.isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200 font-semibold animate-pulse'
                }`}
              >
                {item.isDone ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                )}
                <span>{item.label}</span>
                <span className="text-[9px] opacity-75">
                  {item.isDone ? '✓' : 'Missing'}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Optional Letter Type selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Letter Category
          </label>
          <div className="relative">
            <select
              value={context.letterType}
              onChange={(e) => onChange({ letterType: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none font-medium"
            >
              {LETTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 1. Recipient (Required) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
              <span>1. Recipient</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasRecipient ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Ready
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Professor Kim, Sarah Chen, Manager Davis"
              value={context.recipient}
              onChange={(e) => onChange({ recipient: e.target.value })}
              className={`w-full text-xs rounded-xl border px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
                !hasRecipient
                  ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
        </div>

        {/* 2. Relationship (Required) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
              <span>2. Relationship Context</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasRelationship ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Ready
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. Faculty mentor and project advisor, close colleague of 3 years"
            value={context.relationship}
            onChange={(e) => onChange({ relationship: e.target.value })}
            className={`w-full text-xs rounded-xl border px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
              !hasRelationship
                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {/* 3. Purpose (Required) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
              <span>3. Core Purpose / Message</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasPurpose ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Ready
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. thank-you for mentorship, setting boundary around project scope"
            value={context.purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
            className={`w-full text-xs rounded-xl border px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
              !hasPurpose
                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {/* 4. Concrete Memory & Specific Details (Required anti-hallucination anchor) */}
        <div className={`rounded-xl border p-3.5 transition-colors ${
          !hasDetails ? 'border-rose-300 bg-rose-50/30' : 'border-amber-200 bg-amber-50/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
              <span>4. Concrete Memory / Detail</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasDetails ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-1.5 py-0.2 rounded border border-rose-300">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300">
                ✓ Ready (Anti-Cliché Anchor)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 mb-2 leading-tight">
            Provide at least one real memory, shared milestone, or tangible detail (e.g. <em>"weekly feedback on my prototype"</em>).
          </p>
          <textarea
            rows={2}
            placeholder="e.g. weekly feedback on my prototype, debugging my project late Tuesday, your book recommendation on Sunday"
            value={context.concreteDetails}
            onChange={(e) => onChange({ concreteDetails: e.target.value })}
            className={`w-full text-xs rounded-lg border bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium ${
              !hasDetails ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-amber-300/80 focus:border-amber-500 focus:ring-amber-500/20'
            }`}
          />
        </div>

        {/* 5. Desired Tone & Preset Tone Chips (Required) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
              <span>5. Desired Tone</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasTone ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Ready ({context.tone})
              </span>
            )}
          </div>

          {/* Preset Tone Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {PRESET_TONES.map((preset) => {
              const isSelected = context.tone.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => onChange({ tone: preset })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom tone field */}
          <input
            type="text"
            placeholder="Or type a custom tone (e.g. warm professional, gentle yet direct)"
            value={context.tone}
            onChange={(e) => onChange({ tone: e.target.value })}
            className={`w-full text-xs rounded-xl border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium ${
              !hasTone ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300 bg-white'
            }`}
          />

          {/* Preserve My Voice Toggle */}
          <div className="mt-2.5 p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-amber-50/50 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-950">
                  Preserve my voice
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  context.preserveVoice !== false
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {context.preserveVoice !== false ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Role Card treats tone as a hard constraint, avoids clichés, and keeps any user-approved sentences unchanged during revision.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onChange({ preserveVoice: context.preserveVoice === false ? true : false })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                context.preserveVoice !== false ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              title="Toggle Preserve My Voice"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  context.preserveVoice !== false ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 6. Boundaries / Phrases to Avoid (Required) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>6. Boundaries / Phrases to Avoid</span>
              <span className="text-rose-500">*</span>
            </label>
            {!hasBoundaries ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Required — Missing
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Ready
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. Do not mention grades or job search; avoid making future travel commitments"
            value={context.boundaries}
            onChange={(e) => onChange({ boundaries: e.target.value })}
            className={`w-full text-xs rounded-xl border px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-colors ${
              !hasBoundaries
                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {/* 7. Target Length / Specific Request */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Length / Specific Request
          </label>
          <div className="flex gap-2">
            {['a 150-word letter', 'Short note (~100 words)', 'Medium letter (~250 words)'].map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => onChange({ targetLength: len })}
                className={`flex-1 text-[11px] py-1.5 px-2 rounded-lg border text-center transition-all ${
                  context.targetLength === len
                    ? 'bg-slate-800 text-white border-slate-800 font-medium'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          
          <button
            onClick={handleDraftClick}
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all active:scale-[0.99] cursor-pointer ${
              isAllComplete
                ? 'bg-slate-900 hover:bg-slate-800 text-white ring-2 ring-emerald-500/30'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isAllComplete ? (
              <Sparkles className="w-4 h-4 text-amber-300" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white" />
            )}
            <span>
              {isAllComplete
                ? 'All 6 Requirements Met — Generate Draft'
                : `Complete Intake (${6 - completedCount} missing) — Ask Coach`}
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onAskReflection}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Guide Reflection (Max 2 Questions)</span>
            </button>

            <button
              onClick={onReset}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs transition-colors"
              title="Reset inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
