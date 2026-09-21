import React from 'react';
import Link from 'next/link';
import {
  Users,
  Globe2,
  FileQuestion,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  GitCompare,
  FileText,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/dashboard/StatCard';
import { ExpertCard } from '@/components/dashboard/ExpertCard';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { Badge } from '@/components/common/Badge';
import { EXPERTS } from '@/data/experts';
import { RECENT_INSIGHTS } from '@/data/insights';

export default function DashboardPage() {
  return (
    <PageContainer maxWidth="wide" className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 p-8 sm:p-10 shadow-xs">
        {/* Subtle accent corner badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="cream" size="md">
            <span className="w-2 h-2 rounded-full bg-[#FF9100] mr-1 inline-block" />
            European Robotic Surgery Market Intelligence
          </Badge>
          <span className="text-xs text-stone-500 font-medium">3 Target Markets Verified</span>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Expert Interview Intelligence
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            Analyze expert perspectives, compare markets, and discover evidence-backed insights
            across healthcare systems in France, Germany, and the United Kingdom.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/analysis"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#12544F] text-white hover:bg-[#0d3e3a] active:bg-[#0a2e2b] font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <span>Explore Interviews</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>

          <Link
            href="/ask"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FDF4D2] text-[#12544F] hover:bg-[#faecc0] active:bg-[#f6e4ac] border border-[#f1de9f] font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FF9100]" />
            <span>Ask AI</span>
          </Link>
        </div>

        {/* Value Prop Micro Bar */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-6 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#12544F]" />
            <span>100% Verbatim Quote Citations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF9100]" />
            <span>Exact Timestamp Traceability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#12544F]" />
            <span>Neutral Cross-Market Synthesis</span>
          </div>
        </div>
      </section>

      {/* Overview Statistics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Key Metrics & Evidence Coverage
          </h2>
          <span className="text-xs text-[#12544F] font-semibold">Grounded in Primary Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            label="Expert Interviews"
            value="3"
            subtitle="Clinical & Procurement Leaders"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Markets"
            value="3"
            subtitle="France, Germany, United Kingdom"
            icon={<Globe2 className="w-5 h-5" />}
          />
          <StatCard
            label="Interview Questions"
            value="6"
            subtitle="Uniform Cross-Market Guide"
            icon={<FileQuestion className="w-5 h-5" />}
          />
          <StatCard
            label="Analysis"
            value="100%"
            subtitle="Evidence-Backed & Cited"
            highlight={true}
            icon={<ShieldCheck className="w-5 h-5 text-[#C46E00]" />}
          />
        </div>
      </section>

      {/* 3 Expert Profiles Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Featured Expert Perspectives
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select an expert to inspect individual market answers, quotes, and timestamps.
            </p>
          </div>
          <Link
            href="/analysis"
            className="text-xs font-semibold text-[#12544F] hover:underline flex items-center gap-1"
          >
            <span>View Full Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EXPERTS.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      </section>

      {/* Research Overview Section */}
      <section className="bg-[#FAF7EA]/80 border border-[#F3E5AB] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FF9100] uppercase tracking-wider">
              Synthesis & Methodology
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
              Research Overview
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Structured findings across thematic commonalities, institutional divergences, and raw transcripts.
            </p>
          </div>

          <Link
            href="/comparison"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#12544F] hover:bg-stone-50 transition-colors shadow-xs"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#12544F]" />
            <span>Open Comparative Matrix</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Common Themes */}
          <Link
            href="/comparison#themes"
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#12544F] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#12544F]/10 text-[#12544F] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#12544F] bg-[#12544F]/10 px-2 py-0.5 rounded-full">
                5 Identified
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
              Common Themes
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Adoption growth, economic scrutiny, surgeon training, hospital tiering, and clinical threshold rules.
            </p>
          </Link>

          {/* Market Differences */}
          <Link
            href="/comparison#differences"
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#FF9100] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF9100]/15 text-[#C46E00] flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#C46E00] bg-[#FF9100]/15 px-2 py-0.5 rounded-full">
                3 Key Differences
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
              Market Differences
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              DACH TCO prioritization vs French capital committees vs UK NHS theatre staffing bottlenecks.
            </p>
          </Link>

          {/* Evidence Sources */}
          <Link
            href="/transcripts"
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#12544F] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                3 Transcripts
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
              Evidence Sources
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Complete audio-verified transcript dialogues with time-indexed speaker utterances and copy utilities.
            </p>
          </Link>
        </div>
      </section>

      {/* Recent Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Recent Evidence Insights
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Exact quotes extracted directly from French, German, and UK hospital interviews.
            </p>
          </div>
          <Link
            href="/analysis"
            className="text-xs font-semibold text-[#12544F] hover:underline"
          >
            Browse All 18 Supporting Evidence Cards
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {RECENT_INSIGHTS.map((item) => (
            <InsightCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              country={item.country}
              flag={item.flag}
              expert={item.expert}
              timestamp={item.timestamp}
              quote={item.quote}
              marketId={item.marketId}
              questionId={item.questionId}
            />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
