/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { InfoModal } from './components/InfoModal';
import { GuidedInputsPanel } from './components/GuidedInputsPanel';
import { ChatPanel } from './components/ChatPanel';
import { EditableDraftPanel } from './components/EditableDraftPanel';
import { StandardTestCard, STANDARD_TEST_DATA } from './components/StandardTestCard';
import { StandardTestComparePanel } from './components/StandardTestComparePanel';
import { LetterContext, ChatMessage, DraftVersion, CoachApiResponse } from './types';
import { 
  MessageSquare, 
  FileEdit, 
  Columns, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Scale,
  X
} from 'lucide-react';

const INITIAL_CONTEXT: LetterContext = {
  letterType: 'Thank-You / Mentorship',
  recipient: '',
  relationship: '',
  purpose: '',
  concreteDetails: '',
  tone: 'warm professional',
  boundaries: '',
  targetLength: 'a 150-word letter',
  preserveVoice: true,
};

export default function App() {
  const [context, setContext] = useState<LetterContext>(INITIAL_CONTEXT);
  const [draftText, setDraftText] = useState<string>('');
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [infoTab, setInfoTab] = useState<'all' | 'intent' | 'journey' | 'rolecard' | 'diagram'>('diagram');
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'split' | 'chat' | 'draft'>('split');
  const [isDraftAccepted, setIsDraftAccepted] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Helper to append a message to chat history
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  // Helper to record a new draft version (keeps at least 3 timestamped versions with restore)
  const recordDraftVersion = (
    newDraft: string, 
    label: string, 
    source: 'coach' | 'user',
    isAccepted = false,
    changeSummary?: string
  ) => {
    if (!newDraft.trim()) return;
    const wordCount = newDraft.trim().split(/\s+/).length;
    const newVersion: DraftVersion = {
      id: Math.random().toString(36).substring(2, 9),
      versionNumber: versions.length + 1,
      text: newDraft,
      wordCount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label,
      source,
      isAccepted,
      changeSummary,
    };
    setVersions((prev) => [...prev, newVersion]);
  };

  // Main API caller
  const callCoachApi = async (params: {
    ctx: LetterContext;
    userMsg?: string;
    requestDraftNow: boolean;
  }) => {
    setIsLoading(true);
    setErrorBanner(null);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: params.ctx,
          messages,
          currentDraft: draftText,
          userMessage: params.userMsg,
          requestDraftNow: params.requestDraftNow,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const data: CoachApiResponse = await response.json();

      // If a draft was generated or revised
      if (data.hasDraft && data.draft && data.draft.trim().length > 0) {
        setDraftText(data.draft);
        setIsDraftAccepted(false); // New draft/revision resets accepted state
        recordDraftVersion(
          data.draft,
          params.requestDraftNow ? 'Coach Initial Draft' : 'Coach Revision',
          'coach',
          false,
          data.changeSummary
        );
      }

      // Add coach reply to chat (including changeSummary if provided)
      addMessage({
        role: 'assistant',
        content: data.reply,
        changeSummary: data.changeSummary,
        knownDetailsUsed: data.knownDetailsUsed,
        suggestionsProvided: data.suggestionsProvided,
        clarifyingQuestions: data.clarifyingQuestions,
        toneAssessment: data.toneAssessment,
        associatedDraft: data.hasDraft ? data.draft : undefined,
      });

    } catch (err: any) {
      console.error('Error invoking Thoughtful Letter Coach:', err);
      setErrorBanner(err.message || 'Failed to communicate with Thoughtful Letter Coach.');
      addMessage({
        role: 'assistant',
        content: `I encountered an issue connecting to the Gemini engine: ${err.message}. Please check your network or try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check missing required intake fields (strictly 6 fields)
  const getMissingIntakeFields = (ctx: LetterContext) => {
    const missing: string[] = [];
    if (!ctx.recipient.trim()) missing.push('recipient');
    if (!ctx.purpose.trim()) missing.push('purpose');
    if (!ctx.relationship.trim()) missing.push('relationship');
    if (!ctx.concreteDetails.trim()) missing.push('concrete detail or memory');
    if (!ctx.tone.trim()) missing.push('desired tone');
    if (!ctx.boundaries.trim()) missing.push('boundaries/phrases to avoid');
    return missing;
  };

  // Run Draft Action: Requires all 6 fields before generating any draft
  const handleRunDraft = (overrideContext?: LetterContext) => {
    const activeCtx = overrideContext || context;
    const missing = getMissingIntakeFields(activeCtx);

    // If any of the 6 fields are missing and no existing draft exists, enforce intake questions (max 2)
    if (missing.length > 0 && (!draftText || draftText.trim().length === 0)) {
      addMessage({
        role: 'user',
        content: `I'd like to draft a letter, but I still need to complete: ${missing.join(', ')}. Please ask me no more than two concise clarifying questions to help me provide these.`,
      });
      callCoachApi({
        ctx: activeCtx,
        userMsg: `The user attempted to draft without completing all 6 pre-draft intake fields. Missing fields: ${missing.join(', ')}. Ask NO MORE THAN TWO concise clarifying questions at a time to help them provide this context. Do not draft yet.`,
        requestDraftNow: false,
      });
      return;
    }

    addMessage({
      role: 'user',
      content: `Please draft the ${activeCtx.letterType} for ${activeCtx.recipient}. 
- Relationship: ${activeCtx.relationship}
- Purpose: ${activeCtx.purpose}
- Concrete Details: ${activeCtx.concreteDetails}
- Desired Tone: ${activeCtx.tone} (Strict constraint, no clichés)
- Boundaries / Phrases to Avoid: ${activeCtx.boundaries}
- Target Length: ${activeCtx.targetLength}
- Preserve My Voice: ${activeCtx.preserveVoice ? 'Enabled' : 'Disabled'}`,
    });

    callCoachApi({
      ctx: activeCtx,
      requestDraftNow: true,
    });
  };

  // Ask for Guided Reflection First (strictly max 2 questions)
  const handleAskReflection = () => {
    const missing = getMissingIntakeFields(context);
    const userPrompt = missing.length > 0
      ? `I'm preparing to write a letter. Currently missing from intake: ${missing.join(', ')}. Please ask me no more than two concise clarifying questions to guide my reflection.`
      : `All 6 intake details are provided. Before drafting, please review my details and ask at most two concise questions if anything could be deeper.`;

    addMessage({
      role: 'user',
      content: userPrompt,
    });

    callCoachApi({
      ctx: context,
      userMsg: `${userPrompt} (Remember: strictly ask no more than two concise clarifying questions at a time).`,
      requestDraftNow: false,
    });
  };

  // Send message in chat
  const handleSendMessage = (userMessage: string) => {
    addMessage({
      role: 'user',
      content: userMessage,
    });
    callCoachApi({
      ctx: context,
      userMsg: `${userMessage} (Keep user-approved sentences unchanged; preserve voice; tone "${context.tone}" constraint; avoid clichés).`,
      requestDraftNow: false,
    });
  };

  // Targeted Revision Request (Iteration 3 & 2)
  const handleSendRevisionRequest = (instruction: string) => {
    const userMsg = `Targeted revision: "${instruction}". Keep all user-approved sentences unchanged, preserve my voice, adhere strictly to tone "${context.tone}" without clichés, and include a short change summary.`;
    addMessage({
      role: 'user',
      content: userMsg,
    });
    callCoachApi({
      ctx: context,
      userMsg,
      requestDraftNow: false,
    });
  };

  // Explicit Accept Control (Iteration 3)
  const handleAcceptDraft = () => {
    if (!draftText.trim()) return;
    setIsDraftAccepted(true);
    recordDraftVersion(draftText, 'User Accepted Draft', 'user', true);
    addMessage({
      role: 'assistant',
      content: `🎉 Excellent! You have accepted this draft. All sentences are approved and your voice is locked. You can copy the final text with 1 click.`,
    });
  };

  // Restore past version (Iteration 3)
  const handleRestoreVersion = (version: DraftVersion) => {
    setDraftText(version.text);
    setIsDraftAccepted(Boolean(version.isAccepted));
    recordDraftVersion(version.text, `Restored Version ${version.versionNumber}`, 'user', Boolean(version.isAccepted));
    addMessage({
      role: 'assistant',
      content: `Restored Version ${version.versionNumber} (${version.label}, ${version.wordCount} words) into your active editor.`,
    });
  };

  // Manual draft change in editor
  const handleDraftChange = (newText: string) => {
    setDraftText(newText);
    if (isDraftAccepted) setIsDraftAccepted(false);
  };

  // Open info modal with explicit tab (Iteration 3: ensures system diagram opens reliably)
  const handleOpenInfo = (tab: 'all' | 'intent' | 'journey' | 'rolecard' | 'diagram' = 'diagram') => {
    setInfoTab(tab);
    setIsInfoOpen(true);
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm('Reset all form fields and conversation?')) {
      setContext(INITIAL_CONTEXT);
      setDraftText('');
      setVersions([]);
      setMessages([]);
      setIsDraftAccepted(false);
      setErrorBanner(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Top Header */}
      <Header
        onOpenInfo={handleOpenInfo}
        onOpenBenchmark={() => setShowBenchmarkModal(true)}
        onQuickStandardTest={() => {
          setContext(STANDARD_TEST_DATA);
          handleRunDraft(STANDARD_TEST_DATA);
        }}
        isLoading={isLoading}
      />

      {/* Error Banner if any */}
      {errorBanner && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-600 hover:text-rose-900 font-semibold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {/* Responsive Layout Grid: Left Panel (Inputs) + Right Panel (Chat & Editable Draft) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          
          {/* LEFT PANEL: Guided Inputs & Context (5 cols on desktop) */}
          <section className="lg:col-span-5 w-full">
            <GuidedInputsPanel
              context={context}
              onChange={(updated) => setContext((prev) => ({ ...prev, ...updated }))}
              onRunDraft={handleRunDraft}
              onAskReflection={handleAskReflection}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </section>

          {/* RIGHT PANEL: Conversational Partner & Editable Draft (7 cols on desktop) */}
          <section className="lg:col-span-7 flex flex-col h-full min-h-[660px] space-y-3">
            
            {/* View Switcher Tabs (Split View, Chat Only, Draft Only, Benchmark Panel) */}
            <div className="flex flex-wrap items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs gap-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('split')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'split'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Side-by-Side</span>
                  <span className="sm:hidden">Split</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Coach Chat</span>
                  {messages.length > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
                      {messages.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('draft')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'draft'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Editable Draft</span>
                  {draftText.trim().length > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-mono">
                      {draftText.trim().split(/\s+/).length}w
                    </span>
                  )}
                </button>
              </div>

              {/* Benchmark Trigger & Role Status */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBenchmarkModal(true)}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                >
                  <Scale className="w-3 h-3 text-amber-600" />
                  <span>Compare Baseline</span>
                </button>

                <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            {/* Dynamic Content Views */}
            <div className="flex-1 min-h-[600px]">
              {activeTab === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="h-[600px]">
                    <ChatPanel
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onApplyDraftToEditor={(txt) => setDraftText(txt)}
                      isLoading={isLoading}
                    />
                  </div>
                  <div className="h-[600px]">
                    <EditableDraftPanel
                      draftText={draftText}
                      onChangeDraft={handleDraftChange}
                      versions={versions}
                      onSelectVersion={(v) => setDraftText(v.text)}
                      onRestoreVersion={handleRestoreVersion}
                      targetLengthDescription={context.targetLength}
                      onSendRevisionRequest={handleSendRevisionRequest}
                      onAcceptDraft={handleAcceptDraft}
                      isDraftAccepted={isDraftAccepted}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-[620px]">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onApplyDraftToEditor={(txt) => {
                      setDraftText(txt);
                      setActiveTab('draft');
                    }}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'draft' && (
                <div className="h-[620px]">
                  <EditableDraftPanel
                    draftText={draftText}
                    onChangeDraft={handleDraftChange}
                    versions={versions}
                    onSelectVersion={(v) => setDraftText(v.text)}
                    onRestoreVersion={handleRestoreVersion}
                    targetLengthDescription={context.targetLength}
                    onSendRevisionRequest={handleSendRevisionRequest}
                    onAcceptDraft={handleAcceptDraft}
                    isDraftAccepted={isDraftAccepted}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>

          </section>

        </div>

      </main>

      {/* Information Modal (Reliably opens System Diagram or selected tab) */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        initialTab={infoTab}
      />

      {/* Standard-Test Results Comparison Modal (Iteration 3) */}
      {showBenchmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Standard-Test Benchmark: Baseline (No Role Card) vs. Role-Card Applied
                </h3>
              </div>
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <StandardTestComparePanel
                onLoadRoleCardDraft={(draft) => {
                  setDraftText(draft);
                  recordDraftVersion(draft, 'Verified Role-Card Benchmark', 'coach', true);
                  setShowBenchmarkModal(false);
                  setActiveTab('draft');
                }}
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
