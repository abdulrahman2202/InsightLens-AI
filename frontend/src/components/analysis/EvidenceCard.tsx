'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SupportingEvidence } from '@/types';
import { Quote, Clock, ExternalLink, Copy, Check, FileText } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { copyTextToClipboard } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface EvidenceCardProps {
  evidence: SupportingEvidence;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyTextToClipboard(evidence.exactQuote);
    if (success) {
      setCopied(true);
      showToast('Exact quote copied to clipboard', `${evidence.country} • ${evidence.timestamp}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 group">
      {/* Top row: Country flag + Expert name + Role + Orange Timestamp */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={evidence.country}>
            {evidence.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-stone-900">
                {evidence.expertName}
              </h4>
              <Badge variant="stone" size="sm">
                {evidence.country}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[#12544F]">{evidence.expertRole}</p>
          </div>
        </div>

        {/* Clickable Orange Timestamp */}
        <Link
          href={evidence.sourceTranscriptUrl}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF9100] bg-[#FF9100]/10 hover:bg-[#FF9100]/20 px-2.5 py-1 rounded-lg transition-colors group/time"
          title="Jump to utterance in transcript"
        >
          <Clock className="w-3.5 h-3.5 text-[#FF9100]" />
          <span>{evidence.timestamp}</span>
        </Link>
      </div>

      {/* AI Synthesized Answer for this expert */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          AI Answer
        </span>
        <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
          {evidence.aiAnswer}
        </p>
      </div>

      {/* Prominent Exact Quote Box */}
      <div className="relative rounded-2xl bg-[#FAF7EA] border border-[#F3E5AB] p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#12544F]">
            <Quote className="w-4 h-4 text-[#12544F]" />
            <span>Exact Quote</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            title="Copy exact quote"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#12544F]" />
                <span className="text-[#12544F]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-stone-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <blockquote className="text-xs sm:text-sm text-stone-900 font-serif italic leading-relaxed pl-1">
          &ldquo;{evidence.exactQuote}&rdquo;
        </blockquote>
      </div>

      {/* Footer: Source Link + "View in Transcript" button */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-xs text-[#12544F] font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>{evidence.source}</span>
        </div>

        <Link
          href={evidence.sourceTranscriptUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12544F] bg-[#12544F]/10 hover:bg-[#12544F]/20 px-3 py-1.5 rounded-xl border border-[#12544F]/20 transition-colors shadow-xs"
        >
          <span>View in Transcript</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#12544F]" />
        </Link>
      </div>
    </div>
  );
};
