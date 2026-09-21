'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, FileQuestion, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { EXPERTS } from '@/data/experts';
import { INTERVIEW_QUESTIONS } from '@/data/questions';
import { CROSS_MARKET_THEMES } from '@/data/insights';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (url: string) => {
    onClose();
    setQuery('');
    router.push(url);
  };

  const q = query.toLowerCase().trim();

  const filteredQuestions = INTERVIEW_QUESTIONS.filter(
    (item) => item.shortTitle.toLowerCase().includes(q) || item.fullQuestion.toLowerCase().includes(q)
  );

  const filteredExperts = EXPERTS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q)
  );

  const filteredThemes = CROSS_MARKET_THEMES.filter(
    (item) => item.title.toLowerCase().includes(q) || item.shortExplanation.toLowerCase().includes(q)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={false}>
      <div className="-m-6 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 bg-stone-50/50">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, expert transcripts, or cross-market themes..."
            className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1 text-[11px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-mono">
            ESC
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!q && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Quick Navigation
              </p>
              <button
                onClick={() => handleSelect('/ask')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-[#FDF4D2]/60 text-stone-800 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FF9100]/15 text-[#C46E00] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-[#12544F]">Ask InsightLens Research Assistant</span>
                </div>
                <CornerDownLeft className="w-4 h-4 text-stone-300 group-hover:text-[#12544F]" />
              </button>
              <button
                onClick={() => handleSelect('/comparison')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-stone-100 text-stone-800 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#12544F]/10 text-[#12544F] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Compare Cross-Market Insights</span>
                </div>
                <CornerDownLeft className="w-4 h-4 text-stone-300 group-hover:text-stone-700" />
              </button>
            </div>
          )}

          {/* Questions Section */}
          {filteredQuestions.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Interview Questions
              </p>
              {filteredQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSelect(`/analysis?q=${question.id}`)}
                  className="w-full text-left flex items-start justify-between px-3 py-2 rounded-xl text-sm hover:bg-[#FDF4D2]/50 text-stone-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#12544F]/10 text-[#12544F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{question.id}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 group-hover:text-[#12544F]">
                        {question.shortTitle}
                      </p>
                      <p className="text-xs text-stone-500 line-clamp-1">{question.fullQuestion}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#12544F] shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}

          {/* Experts Section */}
          {filteredExperts.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Experts & Transcripts
              </p>
              {filteredExperts.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => handleSelect(`/transcripts/${expert.marketId}`)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-stone-100 text-stone-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{expert.flag}</span>
                    <div>
                      <p className="font-medium text-stone-900">{expert.name}</p>
                      <p className="text-xs text-stone-500">
                        {expert.role} • {expert.country}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#12544F] font-medium group-hover:underline">
                    View Transcript
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Themes Section */}
          {filteredThemes.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Common Themes
              </p>
              {filteredThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect('/comparison')}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-stone-100 text-stone-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#FF9100]/15 text-[#C46E00] font-bold text-xs flex items-center justify-center shrink-0">
                      T{theme.number}
                    </div>
                    <span className="font-medium text-stone-900">{theme.title}</span>
                  </div>
                  <span className="text-xs text-stone-400">3 Markets</span>
                </button>
              ))}
            </div>
          )}

          {filteredQuestions.length === 0 &&
            filteredExperts.length === 0 &&
            filteredThemes.length === 0 && (
              <div className="py-8 text-center text-stone-500 text-sm">
                No matching research questions or transcripts found for &quot;{query}&quot;.
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1 py-0.5 rounded bg-white border border-stone-200">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-white border border-stone-200">↓</kbd> to navigate
            </span>
            <span>
              Press <kbd className="px-1 py-0.5 rounded bg-white border border-stone-200">ESC</kbd> to close
            </span>
          </div>
          <span className="text-[#12544F] font-medium">InsightLens AI</span>
        </div>
      </div>
    </Modal>
  );
};
