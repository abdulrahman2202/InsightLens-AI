import React from 'react';
import Link from 'next/link';
import { Expert } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

interface ExpertPerspectiveProps {
  expert: Expert;
}

export const ExpertPerspective: React.FC<ExpertPerspectiveProps> = ({ expert }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{expert.flag}</span>
            <div>
              <h4 className="text-sm font-bold text-stone-900">{expert.name}</h4>
              <p className="text-xs text-[#12544F] font-semibold">{expert.role}</p>
            </div>
          </div>
          <Badge variant="teal" size="sm">
            {expert.country}
          </Badge>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF7EA] border border-[#F3E5AB]">
          <p className="text-xs text-stone-800 leading-relaxed italic font-serif">
            &ldquo;{expert.strategicStance}&rdquo;
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-500 font-medium">
          {expert.totalInsights} Insights Verified
        </span>
        <Link
          href={`/analysis/${expert.marketId}`}
          className="text-xs font-semibold text-[#12544F] hover:underline flex items-center gap-1"
        >
          <span>Market Profile</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
