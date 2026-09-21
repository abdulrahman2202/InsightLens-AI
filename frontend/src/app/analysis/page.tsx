'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuestionSelector } from '@/components/analysis/QuestionSelector';
import { AnswerCard } from '@/components/analysis/AnswerCard';
import { EvidenceCard } from '@/components/analysis/EvidenceCard';
import { Badge } from '@/components/common/Badge';
import { INTERVIEW_QUESTIONS } from '@/data/questions';
import { getAnalysis } from '@/lib/api';
import { QuestionAnalysis, MarketId } from '@/types';
import { Filter, Layers, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const qParam = searchParams.get('q');
  const initialQuestionId = qParam ? parseInt(qParam, 10) : 1;

  const [selectedQuestionId, setSelectedQuestionId] = useState(
    initialQuestionId >= 1 && initialQuestionId <= 6 ? initialQuestionId : 1
  );
  const [selectedMarket, setSelectedMarket] = useState<MarketId | 'all'>('all');
  const [analysisData, setAnalysisData] = useState<QuestionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query parameter changes
  useEffect(() => {
    if (qParam) {
      const parsed = parseInt(qParam, 10);
      if (parsed >= 1 && parsed <= 6 && parsed !== selectedQuestionId) {
        setSelectedQuestionId(parsed);
      }
    }
  }, [qParam]);

  // Load question analysis data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAnalysis(selectedQuestionId, selectedMarket).then((data) => {
      if (isMounted) {
        setAnalysisData(data || null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedQuestionId, selectedMarket]);

  const handleSelectQuestion = (id: number) => {
    setSelectedQuestionId(id);
    startTransition(() => {
      router.push(`/analysis?q=${id}`, { scroll: false });
    });
  };

  const activeQuestion = INTERVIEW_QUESTIONS.find((q) => q.id === selectedQuestionId) || INTERVIEW_QUESTIONS[0];

  const marketOptions: { id: MarketId | 'all'; label: string; flag?: string }[] = [
    { id: 'all', label: 'All Markets' },
    { id: 'france', label: 'France', flag: '🇫🇷' },
    { id: 'germany', label: 'Germany', flag: '🇩🇪' },
    { id: 'uk', label: 'UK', flag: '🇬🇧' },
  ];

  return (
    <PageContainer maxWidth="wide" className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12544F]">
              Primary Research Stream
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-medium">6 Guide Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Interview Analysis
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Explore expert responses to the European robotic surgery interview guide.
          </p>
        </div>

        {/* Market Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1 pl-2 pr-1 text-xs text-stone-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
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

      {/* Main 2-column Grid: Left Questions Sidebar + Right Evidence Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-20 space-y-4">
            <QuestionSelector
              questions={INTERVIEW_QUESTIONS}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={handleSelectQuestion}
            />

            {/* Micro Helper Card */}
            <div className="p-4 rounded-2xl bg-[#FAF7EA] border border-[#F3E5AB] text-xs text-stone-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#12544F]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#12544F]" />
                <span>Evidence Verification</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Click any timestamp badge or &ldquo;View in Transcript&rdquo; button to jump directly to the exact verbatim utterance block in the transcript viewer.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Summary + Supporting Evidence */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {loading || !analysisData ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-44 bg-white rounded-3xl border border-stone-200" />
              <div className="h-60 bg-white rounded-2xl border border-stone-200" />
              <div className="h-60 bg-white rounded-2xl border border-stone-200" />
            </div>
          ) : (
            <>
              {/* Question & AI Summary Card */}
              <AnswerCard
                questionNumber={activeQuestion.id}
                questionTitle={activeQuestion.shortTitle}
                fullQuestion={activeQuestion.fullQuestion}
                summary={analysisData.aiSummary}
                coverageLabel={analysisData.evidenceCoverage.label}
              />

              {/* Supporting Evidence Header */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    Supporting Evidence
                  </h3>
                  <p className="text-xs text-stone-500">
                    Exact expert quotations from verified interview audio transcripts.
                  </p>
                </div>
                <Badge variant="stone" size="sm">
                  {analysisData.evidenceList.length} Evidence {analysisData.evidenceList.length === 1 ? 'Card' : 'Cards'}
                </Badge>
              </div>

              {/* Evidence Cards Stack */}
              <div className="space-y-4">
                {analysisData.evidenceList.map((evidence) => (
                  <EvidenceCard
                    key={`${evidence.marketId}-${activeQuestion.id}`}
                    evidence={evidence}
                  />
                ))}

                {analysisData.evidenceList.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                    No evidence cards match the selected filter. Try selecting &ldquo;All Markets&rdquo;.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth="wide">
          <div className="h-96 flex items-center justify-center text-stone-400">
            Loading analysis...
          </div>
        </PageContainer>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
