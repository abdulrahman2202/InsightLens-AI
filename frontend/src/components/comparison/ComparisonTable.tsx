import React from 'react';
import Link from 'next/link';
import { ComparisonDimension } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Clock, ArrowUpRight } from 'lucide-react';

interface ComparisonTableProps {
  dimensions: ComparisonDimension[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ dimensions }) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-600">
              <th className="py-4 px-5 w-1/4">Insight Dimension</th>
              <th className="py-4 px-5 w-1/4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇫🇷</span>
                  <span className="text-stone-900">France</span>
                  <span className="text-[10px] text-stone-400 font-normal">Dr. Jean Martin</span>
                </div>
              </th>
              <th className="py-4 px-5 w-1/4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇩🇪</span>
                  <span className="text-stone-900">Germany</span>
                  <span className="text-[10px] text-stone-400 font-normal">Anna Keller</span>
                </div>
              </th>
              <th className="py-4 px-5 w-1/4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-stone-900">United Kingdom</span>
                  <span className="text-[10px] text-stone-400 font-normal">Dr. Emily Carter</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {dimensions.map((row, idx) => (
              <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                {/* Dimension & Category */}
                <td className="py-4 px-5 align-top">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#12544F]">
                    {row.category}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">{row.dimension}</h4>
                </td>

                {/* France Cell */}
                <td className="py-4 px-5 align-top space-y-2">
                  <p className="text-stone-800 leading-relaxed">{row.france.summary}</p>
                  <div className="p-2 rounded-lg bg-[#FAF7EA] border border-[#F3E5AB] text-[11px] text-stone-700 italic">
                    &ldquo;{row.france.quoteSnippet}&rdquo;
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-[#FF9100] font-bold">t: {row.france.timestamp}</span>
                    <Link
                      href={`/transcripts/france?t=${row.france.timestamp}`}
                      className="text-[#12544F] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Cite</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </td>

                {/* Germany Cell */}
                <td className="py-4 px-5 align-top space-y-2">
                  <p className="text-stone-800 leading-relaxed">{row.germany.summary}</p>
                  <div className="p-2 rounded-lg bg-[#FAF7EA] border border-[#F3E5AB] text-[11px] text-stone-700 italic">
                    &ldquo;{row.germany.quoteSnippet}&rdquo;
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-[#FF9100] font-bold">t: {row.germany.timestamp}</span>
                    <Link
                      href={`/transcripts/germany?t=${row.germany.timestamp}`}
                      className="text-[#12544F] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Cite</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </td>

                {/* UK Cell */}
                <td className="py-4 px-5 align-top space-y-2">
                  <p className="text-stone-800 leading-relaxed">{row.uk.summary}</p>
                  <div className="p-2 rounded-lg bg-[#FAF7EA] border border-[#F3E5AB] text-[11px] text-stone-700 italic">
                    &ldquo;{row.uk.quoteSnippet}&rdquo;
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-[#FF9100] font-bold">t: {row.uk.timestamp}</span>
                    <Link
                      href={`/transcripts/uk?t=${row.uk.timestamp}`}
                      className="text-[#12544F] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Cite</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
