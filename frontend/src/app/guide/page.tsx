import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/common/Badge';
import { INTERVIEW_QUESTIONS } from '@/data/questions';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function InterviewGuidePage() {
  return (
    <PageContainer maxWidth="wide" className="space-y-8">
      {/* Header Section */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12544F]">
            Methodology & Framework
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500 font-medium">Standardized Inquiry Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Interview Guide
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Research questions used to analyze expert interviews across European markets.
        </p>
      </div>

      {/* Guide Objective Card */}
      <div className="bg-[#FAF7EA] border border-[#F3E5AB] rounded-3xl p-6 sm:p-7 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#12544F] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#FF9100]" />
          <span>Research Objective</span>
        </div>
        <p className="text-sm sm:text-base text-stone-800 font-normal leading-relaxed">
          Understand hospital adoption patterns, systemic barriers, capital economics, surgeon training
          imperatives, and procurement behaviour for robotic surgery systems across France, Germany,
          and the United Kingdom.
        </p>
        <div className="pt-2 flex items-center gap-2 text-xs text-stone-500">
          <Layers className="w-3.5 h-3.5 text-[#12544F]" />
          <span>Applied uniformly to all expert dialogues to enable standardized cross-market comparison.</span>
        </div>
      </div>

      {/* 6 Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTERVIEW_QUESTIONS.map((question) => (
          <div
            key={question.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Number Pill + Category Badge */}
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-[#12544F] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  0{question.id}
                </span>
                <Badge variant="teal" size="sm">
                  {question.category}
                </Badge>
              </div>

              {/* Short Title & Full Prompt */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
                  {question.shortTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-700 mt-2 font-medium leading-relaxed font-serif italic">
                  &ldquo;{question.fullQuestion}&rdquo;
                </p>
              </div>

              {/* Research Rationale */}
              <div className="pt-3 border-t border-stone-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Investigation Rationale
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {question.researchRationale}
                </p>
              </div>
            </div>

            {/* Link to Analysis */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">3 Market Responses</span>
              <Link
                href={`/analysis?q=${question.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF4D2] hover:bg-[#faecc0] text-[#12544F] text-xs font-semibold border border-[#f1de9f] transition-colors shadow-2xs cursor-pointer"
              >
                <span>View Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#12544F] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
