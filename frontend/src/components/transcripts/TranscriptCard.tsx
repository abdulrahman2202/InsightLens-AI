import React from 'react';
import Link from 'next/link';
import { TranscriptSession } from '@/types';
import { Clock, Calendar, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface TranscriptCardProps {
  session: TranscriptSession;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({ session }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Top: Country Flag + Badge + Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={session.country}>
              {session.flag}
            </span>
            <Badge variant="teal" size="sm">
              {session.country}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9100] bg-[#FF9100]/10 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[#FF9100]" />
            <span>{session.duration}</span>
          </div>
        </div>

        {/* Expert Name & Role */}
        <div>
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
            {session.expertName}
          </h3>
          <p className="text-xs font-semibold text-[#12544F]">{session.expertRole}</p>
        </div>

        {/* Utterances count & date */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            {session.utterances.length} Dialogue Turns
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {session.date}
          </span>
        </div>

        {/* Excerpt snippet */}
        <div className="p-3 rounded-xl bg-[#FAF7EA] border border-[#F3E5AB] text-xs text-stone-700 italic font-serif leading-relaxed line-clamp-3">
          &ldquo;{session.utterances[1]?.text}&rdquo;
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-500 font-medium">100% Verbatim Audio Transcript</span>
        <Link
          href={`/transcripts/${session.marketId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Open Transcript</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
