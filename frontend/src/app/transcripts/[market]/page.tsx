'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Play,
  Pause,
  Volume2,
  FileDown,
  BookmarkPlus,
  Sparkles,
  Search,
} from 'lucide-react';
import { getTranscriptByMarket, getExpertByMarket } from '@/lib/api';
import { TranscriptSession, Expert, MarketId } from '@/types';
import { copyTextToClipboard, cn } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

function TranscriptViewerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const market = (params?.market as string)?.toLowerCase() as MarketId;
  const targetTimestamp = searchParams.get('t');

  const [session, setSession] = useState<TranscriptSession | null>(null);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeHighlightTime, setActiveHighlightTime] = useState<string | null>(targetTimestamp);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Audio player mockup state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(25);

  const utteranceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (['france', 'germany', 'uk'].includes(market)) {
      Promise.all([getTranscriptByMarket(market), getExpertByMarket(market)]).then(
        ([sessionData, expertData]) => {
          if (isMounted) {
            setSession(sessionData || null);
            setExpert(expertData || null);
            setLoading(false);
          }
        }
      );
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [market]);

  // Handle URL param target timestamp auto-scroll and illumination
  useEffect(() => {
    if (targetTimestamp && session) {
      setActiveHighlightTime(targetTimestamp);
      // Wait for DOM to render
      setTimeout(() => {
        const el = utteranceRefs.current[targetTimestamp];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
    }
  }, [targetTimestamp, session]);

  const handleCopyQuote = async (text: string, id: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedId(id);
      showToast('Quote copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleUseAsEvidence = (text: string, timestamp: string) => {
    showToast('Tagged as Evidence', `Stored citation: ${session?.country} at ${timestamp}`, 'info');
  };

  const handleCopyFullTranscript = async () => {
    if (!session) return;
    const text = session.utterances
      .map((u) => `[${u.timestamp}] ${u.speaker}:\n${u.text}\n`)
      .join('\n');
    await copyTextToClipboard(text);
    showToast('Full transcript copied to clipboard');
  };

  if (loading) {
    return (
      <PageContainer maxWidth="wide" className="space-y-6">
        <div className="h-20 bg-white rounded-2xl border border-stone-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-white rounded-3xl border border-stone-200 animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-white rounded-3xl border border-stone-200 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!session || !expert) {
    return (
      <PageContainer maxWidth="wide" className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900">Transcript Not Found</h2>
        <p className="text-stone-500 mt-2">The requested transcript does not exist.</p>
        <Link href="/transcripts" className="mt-4 inline-block text-[#12544F] font-semibold underline">
          Back to Transcript Explorer
        </Link>
      </PageContainer>
    );
  }

  const filteredUtterances = session.utterances.filter((u) =>
    searchFilter.trim() === ''
      ? true
      : u.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.speaker.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <PageContainer maxWidth="wide" className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            href="/transcripts"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="Back to Explorer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{session.flag}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {session.country} — Primary Transcript
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Subject: {session.expertName} ({session.expertRole}) • {session.duration} Recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFullTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span>Copy Full Text</span>
          </button>
          <Link
            href={`/analysis/${session.marketId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>View Analysis</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Layout: Left Dialogue Stream + Right Interview Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dialogue Stream */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick inline search inside transcript */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter utterances within this interview..."
              className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#12544F]/40 shadow-2xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-400 hover:text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dialogue turns */}
          <div className="space-y-3">
            {filteredUtterances.map((u) => {
              const isTarget = activeHighlightTime === u.timestamp;
              const isCopied = copiedId === u.id;

              return (
                <div
                  key={u.id}
                  ref={(el) => {
                    utteranceRefs.current[u.timestamp] = el;
                  }}
                  className={cn(
                    'p-4 sm:p-5 rounded-2xl border transition-all duration-300 space-y-2 group',
                    isTarget
                      ? 'bg-[#FAF7EA] border-[#FF9100] shadow-md ring-2 ring-[#FF9100]/30'
                      : u.isInterviewer
                      ? 'bg-stone-50/60 border-stone-200/80'
                      : 'bg-white border-stone-200 shadow-xs hover:border-stone-300'
                  )}
                >
                  {/* Speaker row + Clickable Timestamp */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-bold',
                          u.isInterviewer ? 'text-stone-600' : 'text-[#12544F]'
                        )}
                      >
                        {u.speaker}
                      </span>
                      {u.isInterviewer && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-200/60 text-stone-600">
                          Interviewer
                        </span>
                      )}
                      {!u.isInterviewer && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#12544F]/10 text-[#12544F]">
                          Expert
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveHighlightTime(u.timestamp)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#FF9100] hover:text-[#C46E00] bg-[#FF9100]/10 hover:bg-[#FF9100]/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      title="Click to highlight block"
                    >
                      <Clock className="w-3 h-3 text-[#FF9100]" />
                      <span>{u.timestamp}</span>
                    </button>
                  </div>

                  {/* Utterance Text */}
                  <p
                    className={cn(
                      'text-xs sm:text-sm leading-relaxed',
                      u.isInterviewer
                        ? 'text-stone-700 font-normal'
                        : 'text-stone-900 font-serif font-normal italic'
                    )}
                  >
                    {!u.isInterviewer ? `“${u.text}”` : u.text}
                  </p>

                  {/* Action buttons (Copy Quote, Use as Evidence) */}
                  {!u.isInterviewer && (
                    <div className="pt-2 flex items-center justify-end gap-2 text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyQuote(u.text, u.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-[#12544F]" />
                            <span className="text-[#12544F]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-400" />
                            <span>Copy Quote</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUseAsEvidence(u.text, u.timestamp)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#12544F] bg-[#FDF4D2] hover:bg-[#faecc0] px-2 py-1 rounded-lg border border-[#f1de9f] transition-colors cursor-pointer"
                      >
                        <BookmarkPlus className="w-3 h-3 text-[#FF9100]" />
                        <span>Use as Evidence</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interview Information & Scrub Bar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* Audio Simulation Player Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Audio Recording Playback
                </span>
                <span className="text-[11px] font-semibold text-[#FF9100] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF9100] animate-pulse" />
                  HQ Master
                </span>
              </div>

              {/* Scrubber Bar */}
              <div className="space-y-1">
                <div
                  className="h-2 w-full bg-stone-100 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    setSimulatedProgress(Math.min(Math.max(percent, 0), 100));
                  }}
                >
                  <div
                    className="h-full bg-[#12544F] rounded-full transition-all duration-150"
                    style={{ width: `${simulatedProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>01:32</span>
                  <span>{session.duration}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Audio</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[11px]">1.0x</span>
                </div>
              </div>
            </div>

            {/* Expert Profile Summary */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{session.flag}</span>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">{session.expertName}</h3>
                  <p className="text-xs text-[#12544F] font-semibold">{session.expertRole}</p>
                  <p className="text-[11px] text-stone-400">{session.country}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Interview Date</span>
                  <span className="font-semibold text-stone-800">{session.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Duration</span>
                  <span className="font-semibold text-[#FF9100]">{session.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Word Count</span>
                  <span className="font-semibold text-stone-800">{session.wordCount} words</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Utterances</span>
                  <span className="font-semibold text-stone-800">
                    {session.utterances.length} dialogue turns
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation by Guide Question */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Jump to Inquiries
              </span>

              <div className="space-y-1 text-xs">
                {session.utterances
                  .filter((u) => u.relatedQuestionId && !u.isInterviewer)
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveHighlightTime(u.timestamp);
                        const el = utteranceRefs.current[u.timestamp];
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-[#FDF4D2]/60 transition-colors text-stone-700 hover:text-[#12544F] cursor-pointer group"
                    >
                      <span className="truncate pr-2 font-medium">Q{u.relatedQuestionId} Response</span>
                      <span className="text-[10px] font-mono text-[#FF9100] bg-[#FF9100]/10 px-1.5 py-0.5 rounded shrink-0">
                        {u.timestamp}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function TranscriptViewerPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth="wide">
          <div className="h-96 flex items-center justify-center text-stone-400">
            Loading transcript viewer...
          </div>
        </PageContainer>
      }
    >
      <TranscriptViewerContent />
    </Suspense>
  );
}
