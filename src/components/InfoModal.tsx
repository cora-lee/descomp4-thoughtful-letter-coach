import React, { useState } from 'react';
import { 
  X, 
  Info, 
  BookOpen, 
  Compass, 
  ShieldCheck, 
  GitFork, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  UserCheck,
  Cpu,
  FileEdit,
  Repeat
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | 'intent' | 'journey' | 'rolecard' | 'diagram';
}

export const ROLE_CARD_TEXT = `You are Thoughtful Letter Coach, a patient collaborative writing partner. Ask concise clarifying questions when recipient, purpose, relationship, concrete details, tone, or boundaries are missing. Never invent memories, feelings, promises, or biographical facts. Distinguish known details from suggestions. Draft only after enough context exists or the user explicitly asks for a provisional draft. Match the requested tone and language. Prefer specific natural phrasing over clichés. After every draft, invite targeted revision and preserve user-approved wording. Do not send messages or claim to contact anyone.`;

export const InfoModal: React.FC<InfoModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'diagram',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'intent' | 'journey' | 'rolecard' | 'diagram'>(initialTab);
  const [copiedRoleCard, setCopiedRoleCard] = useState(false);

  // Sync activeTab whenever modal opens with initialTab
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopyRoleCard = () => {
    navigator.clipboard.writeText(ROLE_CARD_TEXT);
    setCopiedRoleCard(true);
    setTimeout(() => setCopiedRoleCard(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50/70 via-slate-50 to-indigo-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">System Architecture & Design Intent</h2>
              <p className="text-xs text-slate-500">Homework Journal – App 3: Thoughtful Letter Coach</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('intent')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'intent' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
          >
            (a) Design Intent
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'journey' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
          >
            (b) User Journey
          </button>
          <button
            onClick={() => setActiveTab('rolecard')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rolecard' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
          >
            (c) Role Card
          </button>
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'diagram' ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
          >
            (d) System Diagram
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">

          {/* Section (a): Design Intent */}
          {(activeTab === 'all' || activeTab === 'intent') && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
              <div className="flex items-center space-x-2 text-amber-800 font-semibold mb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h3 className="text-base">(a) Design Intent</h3>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                Help people write specific, emotionally honest letters without pretending to know facts the user did not provide. The agent should guide reflection before drafting and preserve the user's voice.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200/60 text-xs">
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="font-semibold text-amber-900 block mb-0.5">Anti-Hallucination</span>
                  Never invents memories, feelings, promises, or biographical details.
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="font-semibold text-amber-900 block mb-0.5">Guided Reflection</span>
                  Proactively asks concise clarifying questions before rushing to draft.
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="font-semibold text-amber-900 block mb-0.5">Voice Preservation</span>
                  Protects user-approved wording and prefers natural phrasing over clichés.
                </div>
              </div>
            </div>
          )}

          {/* Section (b): User Journey */}
          {(activeTab === 'all' || activeTab === 'journey') && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold mb-3">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base">(b) 5-Step User Journey</h3>
              </div>
              <ol className="relative border-l border-indigo-200 ml-3 space-y-4">
                <li className="ml-5">
                  <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full text-white text-[11px] font-bold">
                    1
                  </span>
                  <div className="font-semibold text-slate-900">Choose letter type and recipient</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select a format (e.g. Thank-You, Apology, Boundary, Appreciation) and identify the specific recipient.
                  </p>
                </li>
                <li className="ml-5">
                  <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full text-white text-[11px] font-bold">
                    2
                  </span>
                  <div className="font-semibold text-slate-900">Answer short questions about purpose, relationship, concrete memory/details, desired tone, and boundaries</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    All 6 intake elements are required before drafting. When details are missing, the coach asks no more than two concise clarifying questions at a time to anchor the letter in authentic facts and boundaries.
                  </p>
                </li>
                <li className="ml-5">
                  <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full text-white text-[11px] font-bold">
                    3
                  </span>
                  <div className="font-semibold text-slate-900">Review a draft</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Examine the structured draft with clearly marked known facts vs coach suggestions.
                  </p>
                </li>
                <li className="ml-5">
                  <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full text-white text-[11px] font-bold">
                    4
                  </span>
                  <div className="font-semibold text-slate-900">Continue chatting to revise wording, tone, length, or details</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Engage in conversational iteration with Thoughtful Letter Coach to fine-tune phrasing without losing user voice.
                  </p>
                </li>
                <li className="ml-5">
                  <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full text-white text-[11px] font-bold">
                    5
                  </span>
                  <div className="font-semibold text-slate-900">Copy the final draft</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Copy the finalized text with 1 click directly to clipboard for your personal use.
                  </p>
                </li>
              </ol>
            </div>
          )}

          {/* Section (c): Role Card */}
          {(activeTab === 'all' || activeTab === 'rolecard') && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base">(c) Role Card / System Instructions</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Applied to Every Gemini Call
                  </span>
                </div>
                <button
                  onClick={handleCopyRoleCard}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  {copiedRoleCard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Role Card</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
                {ROLE_CARD_TEXT}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-900">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100/80">
                  ✓ Distinguish known facts from suggestions
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100/80">
                  ✓ Preserve user-approved wording
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100/80">
                  ✓ No message sending or external contact claims
                </span>
              </div>
            </div>
          )}

          {/* Section (d): Clear System Diagram */}
          {(activeTab === 'all' || activeTab === 'diagram') && (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 p-5">
              <div className="flex items-center space-x-2 text-indigo-950 font-semibold mb-4">
                <GitFork className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base">(d) System Diagram: Architecture & Data Flow</h3>
              </div>

              {/* Visual Pipeline */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg mb-4">
                <div className="text-xs font-mono text-indigo-300 mb-3 uppercase tracking-wider">Pipeline Flow</div>
                
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-center">
                  
                  {/* Step 1 */}
                  <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-white">User Inputs</div>
                    <div className="text-[10px] text-slate-400 mt-1">Recipient, purpose, memory & tone</div>
                  </div>

                  <div className="hidden md:flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-white">Context Collector</div>
                    <div className="text-[10px] text-slate-400 mt-1">Aggregates facts & boundaries</div>
                  </div>

                  <div className="hidden md:flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-600/50 flex flex-col items-center shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-emerald-300">Role Card / Guardrails</div>
                    <div className="text-[10px] text-emerald-400/80 mt-1">System Instructions injected</div>
                  </div>

                  <div className="hidden md:flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-white">Gemini Coach</div>
                    <div className="text-[10px] text-slate-400 mt-1">Draft or clarifying questions</div>
                  </div>

                  <div className="hidden md:flex justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Step 5 */}
                  <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1">
                      <FileEdit className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-white">Editable Draft</div>
                    <div className="text-[10px] text-slate-400 mt-1">Live user revision & word count</div>
                  </div>

                  <div className="hidden md:flex justify-center text-slate-500">
                    <Repeat className="w-4 h-4 text-amber-400" />
                  </div>

                  {/* Step 6 */}
                  <div className="p-3 bg-amber-950/60 rounded-lg border border-amber-600/40 flex flex-col items-center col-span-1 md:col-span-6 mt-1 md:mt-0">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>User Feedback Loop</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-xl">
                      User continues chatting to adjust tone, length, or phrasing. Coach preserves all user-approved text and provides targeted refinements without hallucinated biographical details.
                    </p>
                  </div>

                </div>
              </div>

              {/* Textual summary of the diagram */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
                <span className="font-bold text-slate-800">Pipeline formula:</span> User inputs → Context collector → Role Card/system instructions → Gemini draft/revision → Editable draft → User feedback loop
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Role Card Active: Anti-Hallucination Guardrails Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg shadow-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
