import React from 'react';
import { InterviewQuestion } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface QuestionSelectorProps {
  questions: InterviewQuestion[];
  selectedQuestionId: number;
  onSelectQuestion: (id: number) => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-xs space-y-1">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 flex items-center justify-between">
        <span>Interview Guide</span>
        <span className="text-stone-500">6 Questions</span>
      </div>

      <div className="space-y-1 pt-1">
        {questions.map((q) => {
          const isSelected = q.id === selectedQuestionId;
          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={cn(
                'w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group',
                isSelected
                  ? 'bg-[#12544F] text-white shadow-sm'
                  : 'text-stone-700 hover:bg-[#FDF4D2]/60 hover:text-[#12544F]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    'w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-600 group-hover:bg-[#12544F]/10 group-hover:text-[#12544F]'
                  )}
                >
                  Q{q.id}
                </span>
                <span className="truncate font-semibold">{q.shortTitle}</span>
              </div>

              <ChevronRight
                className={cn(
                  'w-3.5 h-3.5 shrink-0 transition-transform',
                  isSelected ? 'text-white' : 'text-stone-300 group-hover:text-[#12544F]'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
