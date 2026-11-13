import React, { useState, useRef, useEffect } from 'react';
import { 
  SendHorizontal, 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Bot, 
  User, 
  CornerDownLeft,
  ShieldCheck,
  FileText,
  GitCommit
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onApplyDraftToEditor?: (draftText: string) => void;
  isLoading: boolean;
}

const QUICK_REVISION_PROMPTS = [
  'Tighten to exactly 150 words',
  'Soften the opening sentence',
  'Make the gratitude feel even more specific',
  'Check for any clichés or generic phrasing',
  'Ensure tone is warm yet strictly professional',
  'What clarifying questions do you have before we finalize?',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onApplyDraftToEditor,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center font-semibold text-xs border border-amber-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
              <span>Thoughtful Letter Coach</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500">Collaborative writing partner • Voice preservation</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Anti-Hallucination Active</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shadow-2xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="max-w-xs">
              <p className="font-semibold text-slate-700 text-xs">Start Your Reflection</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Fill in the guided inputs or click "Run Standard Test" to evaluate context and craft an authentic letter draft.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 ${
                    isUser
                      ? 'bg-slate-900 text-white shadow-xs rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.content}
                  </div>

                  {/* If assistant has distinguished details & suggestions */}
                  {!isUser && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      
                      {/* Short Change Summary after Revision (Iteration 2) */}
                      {msg.changeSummary && (
                        <div className="bg-indigo-50/90 p-2.5 rounded-lg border border-indigo-200 shadow-2xs space-y-0.5">
                          <span className="font-semibold text-indigo-950 flex items-center space-x-1.5">
                            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Revision Change Summary</span>
                          </span>
                          <p className="text-indigo-900 leading-relaxed font-medium">
                            {msg.changeSummary}
                          </p>
                        </div>
                      )}

                      {/* Known Facts Anchored */}
                      {msg.knownDetailsUsed && msg.knownDetailsUsed.length > 0 && (
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/70">
                          <span className="font-semibold text-emerald-900 block mb-1 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Anchored User Facts (No Hallucination)</span>
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                            {msg.knownDetailsUsed.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Coach Suggestions Distinguished */}
                      {msg.suggestionsProvided && msg.suggestionsProvided.length > 0 && (
                        <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-200/60">
                          <span className="font-semibold text-indigo-900 block mb-1 flex items-center space-x-1">
                            <Lightbulb className="w-3 h-3 text-indigo-600" />
                            <span>Coach Suggestions (Distinguished from Facts)</span>
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-indigo-800">
                            {msg.suggestionsProvided.map((sug, idx) => (
                              <li key={idx}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Clarifying Questions (strictly max 2) */}
                      {msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0 && (
                        <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/90 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-amber-950 flex items-center space-x-1">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Clarifying Questions ({Math.min(msg.clarifyingQuestions.length, 2)} of 2 max)</span>
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono bg-amber-100/70 px-1.5 py-0.2 rounded">
                              Click to answer
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.clarifyingQuestions.slice(0, 2).map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => onSendMessage(`Regarding "${q}": `)}
                                className="w-full text-left p-2 rounded-lg bg-white hover:bg-amber-100/70 border border-amber-200/80 text-amber-950 font-medium text-[11px] transition-all flex items-center justify-between group shadow-2xs"
                              >
                                <span className="flex-1 pr-2 leading-tight">
                                  <strong className="text-amber-800 mr-1">Q{idx + 1}:</strong> {q}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attached Draft Preview Notification */}
                      {msg.associatedDraft && onApplyDraftToEditor && (
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-600 flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-amber-600" />
                            <span>Updated Draft Ready</span>
                          </span>
                          <button
                            onClick={() => onApplyDraftToEditor(msg.associatedDraft!)}
                            className="text-amber-700 hover:text-amber-800 font-semibold underline text-[11px]"
                          >
                            Sync to Editor
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  <div className={`text-[10px] ${isUser ? 'text-slate-400' : 'text-slate-400'} text-right`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 flex items-center space-x-2 text-xs text-slate-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[11px]">Thoughtful Letter Coach reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Revision Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {QUICK_REVISION_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 transition-all shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
        <div className="relative flex items-end">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to refine phrasing, adjust tone, check length, or add details..."
            disabled={isLoading}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
            title="Send revision request"
          >
            <SendHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Role Card applied to revisions</span>
        </div>
      </form>

    </div>
  );
};
