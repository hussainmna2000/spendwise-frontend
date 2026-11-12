import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  AlertTriangle,
  RefreshCw,
  Settings,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SUGGESTED_CHAT_PROMPTS } from '../data/demoData';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { StructuredChatData } from '../types/finance';

export const ChatbotPage: React.FC = () => {
  const {
    chatSessions,
    activeSession,
    setActiveSessionId,
    createNewChatSession,
    clearActiveChatSession,
    deleteChatSession,
    sendChatPrompt,
    isChatLoading,
    currency,
    apiBaseUrl,
    backendConnected,
    setActivePage,
  } = useFinance();

  const [inputMessage, setInputMessage] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages, isChatLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isChatLoading) return;
    setInputMessage('');
    await sendChatPrompt(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPromptClick = async (prompt: string) => {
    if (isChatLoading) return;
    await sendChatPrompt(prompt);
  };

  // Render structured backend data when returned by the Python Flask endpoint
  const renderStructuredPayload = (data: StructuredChatData) => {
    return (
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
        {data.summary && data.summary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.summary.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700"
              >
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <span className="font-mono-tabular font-bold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(item.value, currency)}
                  </span>
                  {item.changePercent !== undefined && (
                    <span className="font-mono-tabular text-xs text-slate-500">
                      {formatPercent(item.changePercent)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Breakdown
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {data.categoryBreakdown.map((row, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{row.category}</span>
                  <span className="font-mono-tabular font-medium text-slate-900 dark:text-white">
                    {formatCurrency(row.amount, currency)} ({row.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.predictions && (
          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 text-xs">
            <p className="font-semibold text-amber-900 dark:text-amber-300">
              Predicted Next Month Total:{' '}
              <span className="font-mono-tabular">
                {formatCurrency(data.predictions.nextMonthTotal, currency)}
              </span>
            </p>
            {data.predictions.confidence !== undefined && (
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Model Confidence: {data.predictions.confidence}%
              </p>
            )}
          </div>
        )}

        {data.budgetSuggestions && data.budgetSuggestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recommended Budget Adjustments
            </p>
            {data.budgetSuggestions.map((b, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-slate-50 dark:bg-slate-800/70 text-xs flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between font-medium text-slate-900 dark:text-white">
                  <span>{b.category}</span>
                  <span className="font-mono-tabular">
                    {formatCurrency(b.current, currency)} →{' '}
                    {formatCurrency(b.recommended, currency)}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{b.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Find last user prompt so retry works seamlessly
  const lastUserPrompt = [...activeSession.messages]
    .reverse()
    .find((m) => m.role === 'user')?.content;

  return (
    <div className="h-[calc(100vh-7.5rem)] min-h-[560px] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Left Column: Chat History Sidebar (Desktop + Mobile Toggle) */}
      <div
        className={`${
          historyDrawerOpen ? 'fixed inset-0 z-50 bg-slate-950/50 md:static md:bg-transparent' : 'hidden md:flex'
        } md:w-72 border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/70 dark:bg-slate-900/80 shrink-0`}
      >
        <div className="w-72 h-full bg-white md:bg-transparent dark:bg-slate-900 flex flex-col">
          {/* New Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                createNewChatSession();
                setHistoryDrawerOpen(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus size={15} />
              <span>New Chat</span>
            </button>
            {historyDrawerOpen && (
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(false)}
                className="md:hidden px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            )}
          </div>

          {/* Session History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Chat History
            </p>
            {chatSessions.map((session) => {
              const isSelected = session.id === activeSession.id;
              return (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setHistoryDrawerOpen(false);
                    }}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{session.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {session.messages.length} msg · {session.updatedAt}
                      </p>
                    </div>
                  </button>

                  {chatSessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteChatSession(session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 transition-opacity"
                      aria-label={`Delete ${session.title}`}
                      title="Delete session"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flask Endpoint Footer Status */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Flask API Target
              </span>
              <button
                type="button"
                onClick={() => setActivePage('settings')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Configure
              </button>
            </div>
            <p className="font-mono-tabular text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
              {apiBaseUrl}/chat
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Status: {backendConnected ? 'Connected' : 'Waiting for Flask server'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Main Conversation Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Conversation Toolbar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setHistoryDrawerOpen(true)}
              className="md:hidden px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              History ({chatSessions.length})
            </button>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                {activeSession.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                SpendWise AI Financial Assistant · Powered by Flask + Pandas + Scikit-learn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={createNewChatSession}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors whitespace-nowrap"
            >
              <Trash2 size={14} />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Message Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeSession.messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.isError
                        ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
                        : 'bg-slate-900 dark:bg-blue-600 text-white'
                    }`}
                  >
                    {msg.isError ? <AlertTriangle size={16} /> : <Bot size={16} />}
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                    isAssistant
                      ? msg.isError
                        ? 'bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900/70 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70'
                      : 'bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span
                      className={`text-[11px] font-semibold ${
                        isAssistant
                          ? msg.isError
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-slate-600 dark:text-slate-400'
                          : 'text-blue-100'
                      }`}
                    >
                      {isAssistant
                        ? msg.isError
                          ? 'Flask Backend Connection Error'
                          : 'SpendWise AI'
                        : 'You'}
                    </span>
                    <span
                      className={`text-[10px] font-mono-tabular ${
                        isAssistant ? 'text-slate-400 dark:text-slate-500' : 'text-blue-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Structured financial payload if returned by backend */}
                  {msg.structuredData && renderStructuredPayload(msg.structuredData)}

                  {/* Honest Backend Connection Error Diagnostics & Recovery Actions */}
                  {msg.isError && (
                    <div className="mt-3 pt-3 border-t border-red-200/80 dark:border-red-900/60 space-y-2.5">
                      {msg.errorDetails && (
                        <p className="font-mono-tabular text-xs text-red-700 dark:text-red-300 bg-white/80 dark:bg-slate-900/70 px-3 py-2 rounded-lg border border-red-200/60 dark:border-red-900/50">
                          {msg.errorDetails}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {lastUserPrompt && (
                          <button
                            type="button"
                            onClick={() => sendChatPrompt(lastUserPrompt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            <RefreshCw size={13} />
                            <span>Retry Request</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActivePage('settings')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings size={13} />
                          <span>Configure Flask API URL</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / Loading Indicator */}
          {isChatLoading && (
            <div className="flex items-start gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
                <RefreshCw size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                <span>Querying SpendWise Flask AI service...</span>
              </div>
            </div>
          )}

          {/* Clickable Suggested Prompts */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Suggested Financial Prompts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CHAT_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isChatLoading}
                  onClick={() => handleSuggestedPromptClick(prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90"
        >
          <div className="flex items-end gap-2.5">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask SpendWise AI about your spending, predictions, or budget (Press Enter to send)..."
                aria-label="Chat message input"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isChatLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-colors shrink-0 shadow-xs"
            >
              <span>Send</span>
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {confirmClearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-chat-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h3
              id="clear-chat-title"
              className="font-display font-bold text-base text-slate-900 dark:text-white"
            >
              Clear Conversation History?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              This will remove all messages in the current chat session and reset it to the
              SpendWise AI welcome prompt.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearActiveChatSession();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
