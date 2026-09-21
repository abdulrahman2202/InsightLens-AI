'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ThemeCard } from '@/components/comparison/ThemeCard';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { ExpertPerspective } from '@/components/comparison/ExpertPerspective';
import { getCrossMarketThemes, getComparisonDimensions, getExperts } from '@/lib/api';
import { CrossMarketTheme, ComparisonDimension, Expert } from '@/types';
import { Layers, GitCompare, Users, ShieldCheck } from 'lucide-react';

export default function ComparisonPage() {
  const [themes, setThemes] = useState<CrossMarketTheme[]>([]);
  const [dimensions, setDimensions] = useState<ComparisonDimension[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCrossMarketThemes(), getComparisonDimensions(), getExperts()]).then(
      ([themesData, dimensionsData, expertsData]) => {
        if (isMounted) {
          setThemes(themesData);
          setDimensions(dimensionsData);
          setExperts(expertsData);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <PageContainer maxWidth="wide" className="space-y-8">
        <div className="h-32 bg-white rounded-3xl border border-stone-200 animate-pulse" />
        <div className="h-96 bg-white rounded-3xl border border-stone-200 animate-pulse" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide" className="space-y-12">
      {/* Header Section */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12544F]">
            Synthesis & Comparative Intelligence
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500 font-medium">Pan-European Market Dynamics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Cross-Market Insights
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Compare perspectives across France, Germany, and the United Kingdom.
        </p>
      </div>

      {/* SECTION 1: Common Themes */}
      <section id="themes" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#12544F]/10 text-[#12544F] flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">Common Themes</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              5 core structural trends confirmed by experts across all three European health systems.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#12544F] bg-[#12544F]/10 px-3 py-1 rounded-full w-fit">
            3/3 Market Alignment
          </span>
        </div>

        <div className="space-y-3.5">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>

      {/* SECTION 2: Market Differences Comparison Matrix */}
      <section id="differences" className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF9100]/15 text-[#C46E00] flex items-center justify-center">
              <GitCompare className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Market Differences</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Neutral comparative matrix examining procurement governance, adoption pacing, and institutional priorities.
          </p>
        </div>

        <ComparisonTable dimensions={dimensions} />
      </section>

      {/* SECTION 3: Expert Perspectives */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Expert Perspectives</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Executive strategic stances from leadership in France, Germany, and the UK.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {experts.map((expert) => (
            <ExpertPerspective key={expert.id} expert={expert} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
