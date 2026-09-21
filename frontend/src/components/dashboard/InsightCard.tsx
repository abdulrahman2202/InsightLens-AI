import React from 'react';
import Link from 'next/link';
import { Quote, ArrowUpRight, Clock } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface InsightCardProps {
  title: string;
  summary: string;
  country: string;
  flag: string;
  expert: string;
  timestamp: string;
  quote: string;
  marketId: string;
  questionId: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  summary,
  country,
  flag,
  expert,
  timestamp,
  quote,
  marketId,
  questionId,
}) => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 group">
      <div>
        {/* Header: Market flag + Expert name + Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{flag}</span>
            <span className="text-xs font-semibold text-stone-700">{country}</span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-medium truncate">{expert}</span>
          </div>

          <Link
            href={`/transcripts/${marketId}?t=${timestamp}`}
            className="flex items-center gap-1 text-[11px] font-bold text-[#FF9100] bg-[#FF9100]/10 hover:bg-[#FF9100]/20 px-2 py-0.5 rounded-md transition-colors"
          >
            <Clock className="w-3 h-3 text-[#FF9100]" />
            <span>{timestamp}</span>
          </Link>
        </div>

        {/* Title & Summary */}
        <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#12544F] transition-colors mb-1.5">
          {title}
        </h4>
        <p className="text-xs text-stone-600 leading-relaxed mb-3">{summary}</p>

        {/* Verbatim Quote Box */}
        <div className="relative p-3 rounded-xl bg-[#FAF7EA] border border-[#F3E5AB] text-stone-800 text-xs italic leading-relaxed">
          <Quote className="w-3.5 h-3.5 text-[#12544F] mb-1 opacity-70" />
          <p className="line-clamp-3 text-stone-800 font-serif font-normal">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
        <Link
          href={`/analysis?q=${questionId}`}
          className="text-xs font-semibold text-[#12544F] hover:underline"
        >
          View Question {questionId} Analysis
        </Link>
        <Link
          href={`/transcripts/${marketId}?t=${timestamp}`}
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <span>Transcript</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
