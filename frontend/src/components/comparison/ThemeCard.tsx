'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CrossMarketTheme } from '@/types';
import { ChevronDown, ChevronUp, Quote, Clock, Layers, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface ThemeCardProps {
  theme: CrossMarketTheme;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const marketFlags: Record<string, { flag: string; label: string }> = {
    france: { flag: '🇫🇷', label: 'France' },
    germany: { flag: '🇩🇪', label: 'Germany' },
    uk: { flag: '🇬🇧', label: 'UK' },
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all hover:border-stone-300">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Header: Theme number badge + Market badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#FF9100]/15 text-[#C46E00] font-bold text-xs flex items-center justify-center">
              0{theme.number}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">{theme.title}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {theme.markets.map((m) => (
              <Badge key={m} variant="stone" size="sm">
                <span>{marketFlags[m]?.flag}</span>
                <span>{marketFlags[m]?.label}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Short Explanation */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
          {theme.shortExplanation}
        </p>

        {/* Footer Bar: Evidence Count + Expand Toggle */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#12544F]">
            {theme.evidenceCount} Verified Cross-Market Quotes
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12544F] bg-[#FDF4D2] hover:bg-[#faecc0] px-3 py-1.5 rounded-xl border border-[#f1de9f] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Supporting Quotes' : 'Expand Supporting Quotes'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Supporting Evidence Quotes */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-t border-stone-200 space-y-3 animate-in fade-in duration-150">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Supporting Transcripts by Market
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {theme.evidence.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200 p-3.5 flex flex-col justify-between shadow-2xs space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-800">
                      <span>{item.flag}</span>
                      <span>{item.expertName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#FF9100] bg-[#FF9100]/10 px-1.5 py-0.5 rounded">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 italic font-serif leading-relaxed line-clamp-4">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <Link
                    href={`/transcripts/${item.marketId}?t=${item.timestamp}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#12544F] hover:underline"
                  >
                    <span>View in Transcript</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
