'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  GitCompare,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  Menu,
  X,
  ScanEye,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigation: NavSection[] = [
    {
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Research',
      items: [
        {
          name: 'Interview Analysis',
          href: '/analysis',
          icon: FileSpreadsheet,
        },
        {
          name: 'Cross-Market Insights',
          href: '/comparison',
          icon: GitCompare,
        },
        {
          name: 'Transcript Explorer',
          href: '/transcripts',
          icon: FileText,
        },
      ],
    },
    {
      items: [
        {
          name: 'Ask AI',
          href: '/ask',
          icon: Sparkles,
          badge: 'Grounded',
        },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          name: 'Interview Guide',
          href: '/guide',
          icon: BookOpen,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#12544F] text-white select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-[#0d3e3a] flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FDF4D2] flex items-center justify-center text-[#12544F] shadow-sm group-hover:scale-105 transition-transform duration-150">
            <ScanEye className="w-5 h-5 text-[#12544F]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">InsightLens</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FF9100] text-white">
                AI
              </span>
            </div>
            <p className="text-[11px] text-white/70 font-medium">AI Research Platform</p>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden text-white/70 hover:text-white p-1 rounded-lg"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
        {navigation.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    active
                      ? 'bg-[#FDF4D2] text-[#12544F] shadow-sm font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors shrink-0',
                        active ? 'text-[#12544F]' : 'text-white/70 group-hover:text-white'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide',
                          active
                            ? 'bg-[#FF9100] text-white'
                            : 'bg-white/15 text-white/90 group-hover:bg-[#FF9100] group-hover:text-white transition-colors'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF9100] shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Settings item */}
        <div className="pt-2 border-t border-[#0d3e3a]">
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-white/70 group-hover:text-white" />
              <span>Settings</span>
            </div>
            <span className="text-[10px] text-white/50">v1.0</span>
          </button>
        </div>
      </div>

      {/* User / Profile Footer */}
      <div className="p-4 border-t border-[#0d3e3a] bg-[#0d3e3a]/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#FDF4D2] text-[#12544F] font-bold text-xs flex items-center justify-center border border-[#0d3e3a]">
              AM
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#FF9100] ring-2 ring-[#12544F]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Dr. Alex Mercer</p>
            <p className="text-[11px] text-white/60 truncate">Lead Healthcare Analyst</p>
          </div>
          <Radio className="w-3.5 h-3.5 text-[#FF9100] shrink-0 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 shadow-lg">
        {navContent}
      </aside>

      {/* Mobile Trigger Button */}
      <div className="md:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-[#12544F] text-white rounded-xl shadow-md border border-[#0d3e3a] hover:bg-[#0d3e3a] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="InsightLens AI Settings"
        description="Platform preferences and backend connectivity configuration."
      >
        <div className="space-y-4 text-sm text-stone-700">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900">API Connection</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#12544F]/10 text-[#12544F]">
                FastAPI Ready (Local Mock Active)
              </span>
            </div>
            <p className="text-xs text-stone-500">
              The service layer is structured via <code className="text-stone-800 bg-stone-200/60 px-1 py-0.5 rounded">src/lib/api.ts</code> to connect cleanly to your FastAPI endpoints.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900">Evidence Citation Grounding</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF9100]/20 text-[#C46E00]">
                Strict 100% Verbatim Mode
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Every supporting quote and timestamp is verified against the primary European robotic surgery transcripts.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsSettingsOpen(false)}>
              Close Settings
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
