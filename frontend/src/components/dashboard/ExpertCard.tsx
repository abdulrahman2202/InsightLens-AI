import React from 'react';
import Link from 'next/link';
import { Expert } from '@/types';
import { ArrowRight, Sparkles, Clock, BookCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface ExpertCardProps {
  expert: Expert;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert }) => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 group">
      <div>
        {/* Top bar: Flag + Market + Insights count */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={expert.country}>
              {expert.flag}
            </span>
            <Badge variant="teal" size="sm">
              {expert.country}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{expert.interviewDuration}</span>
          </div>
        </div>

        {/* Expert Name & Role */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#12544F] transition-colors">
            {expert.name}
          </h3>
          <p className="text-xs font-semibold text-[#12544F]">{expert.role}</p>
          {expert.institution && (
            <p className="text-[11px] text-stone-400 truncate mt-0.5">{expert.institution}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
          {expert.description}
        </p>

        {/* Key themes chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {expert.keyThemes.slice(0, 3).map((theme, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium border border-stone-200"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Footer bar & CTA */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
          <BookCheck className="w-3.5 h-3.5 text-[#FF9100]" />
          <span>{expert.totalInsights} Insights</span>
        </div>

        <Link
          href={`/analysis/${expert.marketId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12544F] bg-[#FDF4D2] hover:bg-[#faecc0] px-3 py-1.5 rounded-xl border border-[#f1de9f] transition-colors shadow-xs"
        >
          <span>View Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#12544F] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
