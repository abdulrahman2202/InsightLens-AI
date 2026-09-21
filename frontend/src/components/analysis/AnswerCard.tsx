import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface AnswerCardProps {
  questionNumber: number;
  questionTitle: string;
  fullQuestion: string;
  summary: string;
  coverageLabel: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  questionNumber,
  questionTitle,
  fullQuestion,
  summary,
  coverageLabel,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
      {/* Top Question Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#12544F] text-white font-bold text-xs flex items-center justify-center">
            Q{questionNumber}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {questionTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#12544F]" />
            {coverageLabel}
          </Badge>
        </div>
      </div>

      {/* Full Question Prompt */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
          &ldquo;{fullQuestion}&rdquo;
        </h2>
      </div>

      {/* AI Synthesis Box */}
      <div className="relative rounded-2xl bg-[#FAF7EA] border border-[#F3E5AB] p-5 space-y-2">
        <div className="flex items-center gap-2 text-[#12544F] font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#FF9100]" />
          <span>Cross-Market AI Synthesis</span>
        </div>
        <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal">
          {summary}
        </p>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-500 font-medium border-t border-[#f1de9f]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#12544F]" />
          <span>Answers are grounded in transcript evidence across verified European healthcare experts.</span>
        </div>
      </div>
    </div>
  );
};
