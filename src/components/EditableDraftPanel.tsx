import React, { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  FileEdit, 
  History, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Send,
  Eye,
  Sliders,
  X,
  Lock,
  Edit3,
  RefreshCw,
  GitCompare
} from 'lucide-react';
import { DraftVersion } from '../types';

interface EditableDraftPanelProps {
  draftText: string;
  onChangeDraft: (newText: string) => void;
  versions: DraftVersion[];
  onSelectVersion: (version: DraftVersion) => void;
  onRestoreVersion: (version: DraftVersion) => void;
  targetLengthDescription?: string;
  onSendRevisionRequest: (instruction: string) => void;
  onAcceptDraft: () => void;
  isDraftAccepted?: boolean;
  isLoading?: boolean;
}

export const EditableDraftPanel: React.FC<EditableDraftPanelProps> = ({
  draftText,
  onChangeDraft,
  versions,
  onSelectVersion,
  onRestoreVersion,
  targetLengthDescription = 'a 150-word letter',
  onSendRevisionRequest,
  onAcceptDraft,
  isDraftAccepted = false,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReviseBar, setShowReviseBar] = useState(false);
  const [customReviseText, setCustomReviseText] = useState('');
  const [comparingVersion, setComparingVersion] = useState<DraftVersion | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute word count
  const words = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const chars = draftText.length;

  const handleCopy = () => {
    if (!draftText.trim()) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleQuickRevise = (prompt: string) => {
    onSendRevisionRequest(prompt);
    setShowReviseBar(false);
    setCustomReviseText('');
  };

  const handleCustomReviseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReviseText.trim() || isLoading) return;
    onSendRevisionRequest(customReviseText.trim());
    setCustomReviseText('');
    setShowReviseBar(false);
  };

  // Determine target word count if mentioned (e.g. 150 words)
  const targetMatch = targetLengthDescription.match(/(\d+)\s*words?/i);
  const targetWords = targetMatch ? parseInt(targetMatch[1], 10) : 150;
  const wordDiff = words - targetWords;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Draft Panel Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-xs border border-indigo-200">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-semibold text-slate-800">
                Editable Letter Draft
              </h3>
              {isDraftAccepted && (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Accepted</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isEditing ? 'Editing mode active' : 'Explicit Accept • Edit • Revise controls'}
            </p>
          </div>
        </div>

        {/* Explicit Action Controls: Accept, Edit, Revise, Copy */}
        <div className="flex items-center space-x-1.5">
          
          {/* History Button */}
          {versions.length > 0 && (
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setComparingVersion(null);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs rounded-xl border transition-all ${
                showHistory 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="View all timestamped versions & before/after diff"
            >
              <History className="w-3.5 h-3.5" />
              <span>{versions.length} versions</span>
            </button>
          )}

          {/* EDIT Control */}
          <button
            onClick={handleStartEdit}
            disabled={!draftText.trim()}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs rounded-xl border font-medium transition-all ${
              isEditing
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Edit draft text directly"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit</span>
          </button>

          {/* REVISE Control */}
          <button
            onClick={() => setShowReviseBar(!showReviseBar)}
            disabled={!draftText.trim() || isLoading}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs rounded-xl border font-medium transition-all ${
              showReviseBar
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Request targeted coach revision"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Revise</span>
          </button>

          {/* ACCEPT Control */}
          <button
            onClick={onAcceptDraft}
            disabled={!draftText.trim()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-2xs ${
              isDraftAccepted
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40'
            }`}
            title="Accept this draft as final and lock user-approved wording"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isDraftAccepted ? 'Accepted' : 'Accept'}</span>
          </button>

          {/* Copy Final Draft */}
          <button
            onClick={handleCopy}
            disabled={!draftText.trim()}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-40"
            title="Copy final draft to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Revise Control Quick-Bar (when Revise is clicked) */}
      {showReviseBar && draftText.trim() && (
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-950 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Targeted Revision Control (User-Approved Sentences Kept Intact)</span>
            </span>
            <button
              onClick={() => setShowReviseBar(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Tighten to 150 words exactly',
              'Soften closing sign-off',
              'Make opening more conversational',
              'Check for any subtle clichés',
              'Strengthen prototype detail anchor',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleQuickRevise(chip)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-indigo-200 hover:bg-indigo-100/70 text-indigo-900 font-medium transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomReviseSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Or type a specific revision request (e.g. adjust second paragraph, keep first sentence)..."
              value={customReviseText}
              onChange={(e) => setCustomReviseText(e.target.value)}
              className="flex-1 text-xs rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={!customReviseText.trim() || isLoading}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center space-x-1 disabled:opacity-40"
            >
              <Send className="w-3 h-3" />
              <span>Apply</span>
            </button>
          </form>
        </div>
      )}

      {/* Version History Drawer with Before/After Comparison and Restore */}
      {showHistory && versions.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Version History ({versions.length} timestamped snapshots)</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Select any version to compare before/after or restore
            </span>
          </div>

          {/* Version chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {versions.map((v) => {
              const isCurrent = v.text.trim() === draftText.trim();
              const isSelectedForCompare = comparingVersion?.id === v.id;
              return (
                <div
                  key={v.id}
                  className={`p-2.5 rounded-xl border text-left shrink-0 transition-all min-w-[170px] ${
                    isCurrent
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : isSelectedForCompare
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      Version {v.versionNumber}
                    </span>
                    {v.isAccepted && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Accepted
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2 font-mono">
                    {v.label} • {v.wordCount}w • {v.timestamp}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setComparingVersion(isSelectedForCompare ? null : v)}
                      className={`text-[10px] px-2 py-1 rounded-md border font-medium flex items-center space-x-1 ${
                        isSelectedForCompare
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>{isSelectedForCompare ? 'Comparing' : 'Compare'}</span>
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onRestoreVersion(v);
                          setComparingVersion(null);
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-medium flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Before/After Diff Comparison View when a version is selected */}
          {comparingVersion && (
            <div className="mt-3 p-3.5 bg-white rounded-xl border-2 border-indigo-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-900">
                    Comparing Version {comparingVersion.versionNumber} ({comparingVersion.label}) with Current Draft
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRestoreVersion(comparingVersion)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Version {comparingVersion.versionNumber}</span>
                  </button>
                  <button
                    onClick={() => setComparingVersion(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Side-by-side Before / After comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-amber-950 pb-1 border-b border-amber-200">
                    <span>BEFORE: Version {comparingVersion.versionNumber} ({comparingVersion.timestamp})</span>
                    <span className="font-mono text-[10px]">{comparingVersion.wordCount} words</span>
                  </div>
                  <p className="font-serif-letter whitespace-pre-wrap leading-relaxed text-slate-700 pt-1 text-[11px]">
                    {comparingVersion.text}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-emerald-950 pb-1 border-b border-emerald-200">
                    <span>AFTER: Current Draft ({isDraftAccepted ? 'Accepted' : 'Active'})</span>
                    <span className="font-mono text-[10px]">{words} words</span>
                  </div>
                  <p className="font-serif-letter whitespace-pre-wrap leading-relaxed text-slate-800 pt-1 text-[11px]">
                    {draftText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Draft Paper Canvas */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 bg-gradient-to-b from-amber-50/20 via-white to-slate-50/40 relative">
        
        {draftText.trim() === '' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <FileEdit className="w-7 h-7" />
            </div>
            <div className="max-w-sm">
              <h4 className="font-semibold text-slate-700 text-sm">No Draft Generated Yet</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Complete the 6 pre-draft intake fields or run the Standard Test with Professor Kim to see an authentic, customized letter draft appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col bg-white rounded-xl border shadow-sm p-5 sm:p-6 transition-all ${
            isDraftAccepted
              ? 'border-emerald-300 ring-2 ring-emerald-500/10'
              : 'border-slate-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
          }`}>
            
            {/* Paper Header / Watermark info */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isDraftAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-medium text-slate-700">
                  {isDraftAccepted ? 'Accepted Final Draft' : 'Thoughtful Letter Coach Draft'}
                </span>
                <span className="text-slate-400 font-mono">• {targetLengthDescription}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-400">
                  {isEditing ? 'Editing in place' : 'Click text to edit'}
                </span>
              </div>
            </div>

            {/* Editable Textarea with warm editorial font */}
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => {
                onChangeDraft(e.target.value);
                if (!isEditing) setIsEditing(true);
              }}
              placeholder="Your letter will appear here. You can edit any sentence directly..."
              className="w-full flex-1 resize-none font-serif-letter text-base sm:text-lg text-slate-800 leading-relaxed focus:outline-none placeholder-slate-300"
              spellCheck="true"
            />

            {/* Quick action bar inside paper */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>User-approved sentences are preserved during AI revisions</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReviseBar(true)}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Revise with Coach</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Metadata & Word Count Bar */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Word and Character Count with target adherence */}
        <div className="flex items-center space-x-3">
          <div className="flex items-baseline space-x-1 font-mono">
            <span className="font-bold text-slate-900 text-sm">{words}</span>
            <span className="text-slate-500 text-[11px]">words</span>
          </div>

          <div className="h-3 w-px bg-slate-200" />

          <div className="text-slate-500 text-[11px]">
            Target: <span className="font-medium text-slate-700">{targetLengthDescription}</span>
            {targetMatch && (
              <span className={`ml-1.5 font-mono px-1.5 py-0.5 rounded text-[10px] ${
                Math.abs(wordDiff) <= 15
                  ? 'bg-emerald-100 text-emerald-800'
                  : wordDiff > 15
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {wordDiff === 0 ? 'Exact match' : wordDiff > 0 ? `+${wordDiff} words` : `${wordDiff} words`}
              </span>
            )}
          </div>
        </div>

        {/* Accepted / Voice lock status */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>{isDraftAccepted ? 'Draft Accepted • Ready to Copy' : 'Active draft • Accept to finalize'}</span>
        </div>

      </div>

    </div>
  );
};
