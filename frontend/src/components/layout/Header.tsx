'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Sparkles, ChevronRight, CheckCircle2, Globe } from 'lucide-react';
import { CommandMenu } from './CommandMenu';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Dynamic breadcrumb generation
  const getPageMeta = () => {
    if (pathname === '/') {
      return {
        title: 'Executive Intelligence Dashboard',
        breadcrumbs: [{ label: 'InsightLens AI', href: '/' }, { label: 'Dashboard', href: '/' }],
      };
    }
    if (pathname === '/analysis') {
      return {
        title: 'Interview Analysis',
        breadcrumbs: [
          { label: 'Research', href: '/analysis' },
          { label: 'Interview Analysis', href: '/analysis' },
        ],
      };
    }
    if (pathname.startsWith('/analysis/')) {
      const market = pathname.split('/')[2];
      const marketName = market === 'france' ? 'France' : market === 'germany' ? 'Germany' : 'United Kingdom';
      return {
        title: `${marketName} — Expert Deep Dive`,
        breadcrumbs: [
          { label: 'Research', href: '/analysis' },
          { label: 'Interview Analysis', href: '/analysis' },
          { label: marketName, href: pathname },
        ],
      };
    }
    if (pathname === '/comparison') {
      return {
        title: 'Cross-Market Insights',
        breadcrumbs: [
          { label: 'Research', href: '/analysis' },
          { label: 'Cross-Market Insights', href: '/comparison' },
        ],
      };
    }
    if (pathname === '/transcripts') {
      return {
        title: 'Transcript Explorer',
        breadcrumbs: [
          { label: 'Research', href: '/analysis' },
          { label: 'Transcript Explorer', href: '/transcripts' },
        ],
      };
    }
    if (pathname.startsWith('/transcripts/')) {
      const market = pathname.split('/')[2];
      const marketName = market === 'france' ? 'France' : market === 'germany' ? 'Germany' : 'United Kingdom';
      return {
        title: `${marketName} — Transcript Reader`,
        breadcrumbs: [
          { label: 'Transcripts', href: '/transcripts' },
          { label: marketName, href: pathname },
        ],
      };
    }
    if (pathname === '/ask') {
      return {
        title: 'Ask InsightLens Research Assistant',
        breadcrumbs: [{ label: 'AI Intelligence', href: '/ask' }, { label: 'Ask AI', href: '/ask' }],
      };
    }
    if (pathname === '/guide') {
      return {
        title: 'Interview Guide Framework',
        breadcrumbs: [{ label: 'Resources', href: '/guide' }, { label: 'Interview Guide', href: '/guide' }],
      };
    }

    return {
      title: 'InsightLens AI',
      breadcrumbs: [{ label: 'InsightLens AI', href: '/' }],
    };
  };

  const meta = getPageMeta();

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title & Breadcrumbs */}
          <div className="min-w-0 pl-10 md:pl-0">
            {/* Breadcrumb row */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
              {meta.breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.href + i}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-stone-300" />}
                  <Link
                    href={crumb.href}
                    className="hover:text-[#12544F] transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 truncate tracking-tight">
              {meta.title}
            </h1>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200/80 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Search insights...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-stone-400 bg-white rounded border border-stone-200 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Quick Ask AI shortcut */}
            <Link
              href="/ask"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#12544F] bg-[#FDF4D2] hover:bg-[#faecc0] rounded-xl border border-[#f1de9f] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9100]" />
              <span>Ask AI</span>
            </Link>

            {/* Active Market Selector / Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 bg-stone-50 rounded-xl border border-stone-200">
              <Globe className="w-3.5 h-3.5 text-[#12544F]" />
              <span>3 European Markets</span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] text-stone-500">FR, DE, UK</span>
            </div>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF9100]" />
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-40 p-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Recent Analysis Updates
                      </h4>
                      <span className="text-[10px] bg-[#12544F]/10 text-[#12544F] font-semibold px-2 py-0.5 rounded-full">
                        3 New
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#12544F] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-stone-800">Transcripts Fully Indexed</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            France, Germany, and UK interviews parsed with exact timestamps.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#FF9100] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-stone-800">5 Cross-Market Themes Ready</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            Synthesis ready in Cross-Market Insights comparison view.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#12544F] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-stone-800">AI Grounding Verified</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            All citations traced directly to verified utterances.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-[#12544F] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                AM
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Menu */}
      <CommandMenu isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
