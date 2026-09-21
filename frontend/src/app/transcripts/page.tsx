'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { TranscriptCard } from '@/components/transcripts/TranscriptCard';
import { getTranscripts, searchTranscripts } from '@/lib/api';
import { TranscriptSession, MarketId } from '@/types';
import { Search, Filter, Clock, ArrowRight, CornerDownRight, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export default function TranscriptExplorerPage() {
  const [selectedMarket, setSelectedMarket] = useState<MarketId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<TranscriptSession[]>([]);
  const [searchResults, setSearchResults] = useState<
    {
      utteranceId: string;
      marketId: MarketId;
      country: string;
      flag: string;
      expertName: string;
      timestamp: string;
      speaker: string;
      text: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getTranscripts(selectedMarket).then((data) => {
      if (isMounted) {
        setSessions(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedMarket]);

  useEffect(() => {
    let isMounted = true;
    if (searchQuery.trim().length > 1) {
      searchTranscripts(searchQuery, selectedMarket).then((results) => {
        if (isMounted) {
          setSearchResults(results);
        }
      });
    } else {
      setSearchResults([]);
    }

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedMarket]);

  const marketOptions: { id: MarketId | 'all'; label: string; flag?: string }[] = [
    { id: 'all', label: 'All Markets' },
    { id: 'france', label: 'France', flag: '🇫🇷' },
    { id: 'germany', label: 'Germany', flag: '🇩🇪' },
    { id: 'uk', label: 'UK', flag: '🇬🇧' },
  ];

  return (
    <PageContainer maxWidth="wide" className="space-y-8">
      {/* Header Section */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12544F]">
            Primary Source Repository
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500 font-medium">3 Full Audio Transcripts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Transcript Explorer
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Search and explore the original expert interviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all transcripts (e.g. 'capital budget', 'ROI', 'theatre staff')..."
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#12544F]/40 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Market Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-stone-200 shadow-xs shrink-0 self-start md:self-auto">
          {marketOptions.map((opt) => {
            const active = selectedMarket === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedMarket(opt.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  active
                    ? 'bg-[#12544F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                {opt.flag && <span>{opt.flag}</span>}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Search Match Snippets (when searching) */}
      {searchQuery.trim().length > 1 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              Found {searchResults.length} Transcript {searchResults.length === 1 ? 'Match' : 'Matches'} for &quot;{searchQuery}&quot;
            </h3>
            <span className="text-xs text-stone-500">Live text index</span>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((res) => (
                <div
                  key={res.utteranceId}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:border-[#12544F] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{res.flag}</span>
                      <span className="text-xs font-bold text-stone-900">{res.expertName}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">{res.speaker}</span>
                    </div>

                    <Link
                      href={`/transcripts/${res.marketId}?t=${res.timestamp}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#FF9100] bg-[#FF9100]/10 hover:bg-[#FF9100]/20 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <Clock className="w-3 h-3 text-[#FF9100]" />
                      <span>{res.timestamp}</span>
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-serif italic pl-1 border-l-2 border-[#12544F]/40">
                    &ldquo;{res.text}&rdquo;
                  </p>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/transcripts/${res.marketId}?t=${res.timestamp}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#12544F] hover:underline"
                    >
                      <span>Jump to Utterance</span>
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              No matching transcript dialogue found for &quot;{searchQuery}&quot;. Try a different keyword.
            </div>
          )}
        </div>
      ) : (
        /* Default Transcript Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
              Primary European Interviews ({sessions.length})
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#12544F]" />
              <span>Timestamp Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <TranscriptCard key={session.marketId} session={session} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
