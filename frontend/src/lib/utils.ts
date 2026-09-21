import { MarketId } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatTimestamp(timestamp: string): string {
  return timestamp;
}

export function parseSeconds(timestamp: string): number {
  const parts = timestamp.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

export function getMarketColor(marketId: MarketId): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (marketId) {
    case 'france':
      return {
        bg: 'bg-emerald-50',
        text: 'text-[#12544F]',
        border: 'border-[#12544F]/20',
        badge: 'bg-[#12544F]/10 text-[#12544F]',
      };
    case 'germany':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-900',
      };
    case 'uk':
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-900',
        border: 'border-stone-300',
        badge: 'bg-stone-200 text-stone-800',
      };
    default:
      return {
        bg: 'bg-stone-50',
        text: 'text-stone-800',
        border: 'border-stone-200',
        badge: 'bg-stone-100 text-stone-800',
      };
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
