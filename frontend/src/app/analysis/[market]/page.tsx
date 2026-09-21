'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowLeft,
  Quote,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Building2,
  Sparkles,
} from 'lucide-react';
import { getExpertByMarket, getExpertAllAnalyses } from '@/lib/api';
import { Expert, MarketId, InterviewQuestion, QuestionAnalysis } from '@/types';
import { copyTextToClipboard } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function ExpertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const market = (params?.market as string)?.toLowerCase() as MarketId;

  const [expert, setExpert] = useState<Expert | null>(null);
  const [analyses, setAnalyses] = useState<
    {
      question: InterviewQuestion;
      analysis: QuestionAnalysis;
      expertEvidence: QuestionAnalysis['evidenceList'][0];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Accordion state: by default, all questions open or first 2 open
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (['france', 'germany', 'uk'].includes(market)) {
      Promise.all([getExpertByMarket(market), getExpertAllAnalyses(market)]).then(
        ([expertData, analysesData]) => {
          if (isMounted) {
            setExpert(expertData || null);
            setAnalyses(analysesData);
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

  const toggleQuestion = (id: number) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    setOpenQuestions({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  };

  const collapseAll = () => {
    setOpenQuestions({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
  };

  const handleCopyQuote = async (quote: string, questionId: number) => {
    const success = await copyTextToClipboard(quote);
    if (success) {
      setCopiedId(questionId);
      showToast('Exact quote copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="wide" className="space-y-6">
        <div className="h-64 bg-white rounded-3xl border border-stone-200 animate-pulse" />
        <div className="h-96 bg-white rounded-2xl border border-stone-200 animate-pulse" />
      </PageContainer>
    );
  }

  if (!expert) {
    return (
      <PageContainer maxWidth="wide" className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900">Expert Not Found</h2>
        <p className="text-stone-500 mt-2">The requested market profile does not exist.</p>
        <Link href="/analysis" className="mt-4 inline-block text-[#12544F] font-semibold underline">
          Back to Interview Analysis
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide" className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12544F] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Interview Questions</span>
        </Link>
      </div>

      {/* Expert Profile Header Card */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <span className="text-4xl sm:text-5xl shrink-0" role="img" aria-label={expert.country}>
              {expert.flag}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="teal" size="sm">
                  {expert.country}
                </Badge>
                <span className="text-xs text-stone-400 font-medium">•</span>
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {expert.interviewDuration} Interview Duration
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {expert.name}
              </h1>
              <p className="text-sm font-semibold text-[#12544F] mt-0.5">{expert.role}</p>
              {expert.institution && (
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {expert.institution}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/transcripts/${expert.marketId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] text-xs font-semibold shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Transcript</span>
            </Link>
          </div>
        </div>

        {/* Strategic Stance Quote Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7EA] border border-[#F3E5AB] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#12544F] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9100]" />
            <span>Executive Strategic Stance</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-800 italic leading-relaxed">
            &ldquo;{expert.strategicStance}&rdquo;
          </p>
        </div>

        {/* Key Themes Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            Focus Areas:
          </span>
          {expert.keyThemes.map((theme, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium border border-stone-200"
            >
              {theme}
            </span>
          ))}
        </div>
      </section>

      {/* Accordion List Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Interview Inquiries & Evidence
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            All 6 interview-guide questions with verified verbatim responses from {expert.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Expandable Accordions for all 6 questions */}
      <div className="space-y-4">
        {analyses.map(({ question, expertEvidence }) => {
          const isOpen = openQuestions[question.id];

          return (
            <div
              key={question.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs transition-all"
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleQuestion(question.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="w-7 h-7 rounded-lg bg-[#12544F]/10 text-[#12544F] font-bold text-xs flex items-center justify-center shrink-0">
                    Q{question.id}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {question.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                      {question.fullQuestion}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-[#FF9100] bg-[#FF9100]/10 px-2 py-0.5 rounded-md">
                    {expertEvidence.timestamp}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Content */}
              {isOpen && (
                <div className="p-5 pt-0 border-t border-stone-100 space-y-4 animate-in fade-in duration-150">
                  {/* AI Answer */}
                  <div className="space-y-1 mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      AI Synthesized Perspective
                    </span>
                    <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                      {expertEvidence.aiAnswer}
                    </p>
                  </div>

                  {/* Verbatim Supporting Quote */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7EA] border border-[#F3E5AB] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#12544F]">
                        <Quote className="w-3.5 h-3.5" />
                        <span>Verbatim Transcript Quote</span>
                      </div>
                      <button
                        onClick={() => handleCopyQuote(expertEvidence.exactQuote, question.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200 transition-colors cursor-pointer"
                      >
                        {copiedId === question.id ? (
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

                    <blockquote className="text-xs sm:text-sm text-stone-900 font-serif italic leading-relaxed">
                      &ldquo;{expertEvidence.exactQuote}&rdquo;
                    </blockquote>
                  </div>

                  {/* Citation Footer with Jump Link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <span className="text-stone-500 font-medium">
                      Source: <strong className="text-stone-700">{expertEvidence.source}</strong> at{' '}
                      <strong className="text-[#FF9100]">{expertEvidence.timestamp}</strong>
                    </span>

                    <Link
                      href={expertEvidence.sourceTranscriptUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12544F] hover:underline"
                    >
                      <span>Jump to Timestamp in Viewer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
