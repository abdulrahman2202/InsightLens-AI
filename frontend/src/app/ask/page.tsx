'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  FileText,
  Trash2,
  Quote,
} from 'lucide-react';
import { askAssistant } from '@/lib/api';
import { ChatMessage } from '@/types';
import { INITIAL_CHAT_MESSAGES, SUGGESTED_QUESTIONS } from '@/data/mockChat';
import { cn } from '@/lib/utils';

export default function AskAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputQuery('');

    // Add user question message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askAssistant(query);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setError(err?.message || 'An error occurred generating the research synthesis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setError(null);
  };

  return (
    <PageContainer maxWidth="narrow" className="space-y-6 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header Section */}
      <div className="pb-4 border-b border-stone-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12544F]">
              AI Research Assistant
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-medium">Pan-European Grounding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Ask InsightLens
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Ask questions across all expert interviews with direct evidence citations.
          </p>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors cursor-pointer shadow-2xs"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Suggested Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-[#FDF4D2]/60 hover:text-[#12544F] hover:border-[#F3E5AB] transition-all cursor-pointer shadow-2xs text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 space-y-6 pt-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col',
                isUser ? 'items-end' : 'items-start'
              )}
            >
              {/* Message Bubble Container */}
              <div
                className={cn(
                  'max-w-2xl rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs transition-all',
                  isUser
                    ? 'bg-[#12544F] text-white'
                    : 'bg-white border border-stone-200 text-stone-900 w-full'
                )}
              >
                {/* Header within Assistant Message */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FDF4D2] text-[#12544F] flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF9100]" />
                      </div>
                      <span className="text-xs font-bold text-[#12544F]">
                        InsightLens Synthesis
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="teal" size="sm">
                        <ShieldCheck className="w-3 h-3 text-[#12544F]" />
                        <span>Evidence-grounded response</span>
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content text */}
                <p
                  className={cn(
                    'text-sm sm:text-base leading-relaxed',
                    isUser ? 'text-white font-medium' : 'text-stone-800'
                  )}
                >
                  {msg.content}
                </p>

                {/* Supporting Citations Stack (for assistant) */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Supporting Evidence ({msg.citations.length})
                      </span>
                      <span className="text-[11px] text-[#12544F] font-semibold">
                        Sources used: {msg.sourcesCount ?? msg.citations.length} {(msg.sourcesCount ?? msg.citations.length) === 1 ? 'source' : 'sources'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {msg.citations.map((cit, cIdx) => (
                        <div
                          key={cIdx}
                          className="rounded-xl bg-[#FAF7EA] border border-[#F3E5AB] p-3.5 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-stone-800">
                              <span>{cit.flag}</span>
                              <span>{cit.country}</span>
                              <span className="text-stone-300">•</span>
                              <span className="font-semibold text-stone-600">{cit.expertName}</span>
                            </div>

                            <Link
                              href={`/transcripts/${cit.marketId}?t=${cit.timestamp}`}
                              className="flex items-center gap-1 font-bold text-[#FF9100] bg-[#FF9100]/10 hover:bg-[#FF9100]/20 px-2 py-0.5 rounded transition-colors"
                            >
                              <Clock className="w-3 h-3 text-[#FF9100]" />
                              <span>{cit.timestamp}</span>
                            </Link>
                          </div>

                          <p className="font-serif italic text-stone-800 leading-relaxed">
                            &ldquo;{cit.exactQuote}&rdquo;
                          </p>

                          <div className="pt-1 flex justify-between items-center text-[11px]">
                            <span className="text-stone-500 font-medium">{cit.source}</span>
                            <Link
                              href={`/transcripts/${cit.marketId}?t=${cit.timestamp}`}
                              className="text-[#12544F] font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>View in Transcript</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* When no supporting citations found (e.g. Insufficient evidence) */}
                {!isUser && (!msg.citations || msg.citations.length === 0) && (
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="text-[11px] font-medium text-stone-400 italic">
                      No supporting sources found in transcripts.
                    </span>
                    <span className="text-[11px] font-semibold text-stone-400">
                      0 sources
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading skeleton state */}
        {isLoading && (
          <div className="flex flex-col items-start w-full">
            <div className="w-full max-w-2xl bg-white rounded-2xl p-6 border border-stone-200 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FDF4D2] flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF9100]" />
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  Synthesizing transcript evidence...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-stone-100 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-md w-4/6 animate-pulse" />
              </div>
              <div className="h-20 bg-[#FAF7EA] rounded-xl border border-[#F3E5AB] animate-pulse" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Chat Input Bar */}
      <div className="sticky bottom-4 z-10 pt-3">
        <div className="bg-white rounded-2xl border border-stone-300 p-2 shadow-lg flex items-center gap-2 focus-within:border-[#12544F] focus-within:ring-2 focus-within:ring-[#12544F]/20 transition-all">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask a question about the interviews (e.g. 'How do procurement timelines compare?')..."
            className="flex-1 px-4 py-2.5 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-stone-400 mt-2 font-medium">
          InsightLens groundings trace 100% of facts to transcript timestamps.
        </p>
      </div>
    </PageContainer>
  );
}
