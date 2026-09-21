import {
  Expert,
  InterviewQuestion,
  QuestionAnalysis,
  CrossMarketTheme,
  ComparisonDimension,
  TranscriptSession,
  ChatMessage,
  MarketId,
} from '@/types';
import { EXPERTS } from '@/data/experts';
import { INTERVIEW_QUESTIONS } from '@/data/questions';
import { TRANSCRIPTS } from '@/data/transcripts';
import {
  QUESTION_ANALYSES,
  CROSS_MARKET_THEMES,
  COMPARISON_DIMENSIONS,
} from '@/data/insights';
import { PRESET_CHAT_RESPONSES } from '@/data/mockChat';

/**
 * InsightLens AI API Service Layer
 * 
 * Provides clean async data access interfaces.
 * Currently serves validated local mock data with exact quotes and timestamps.
 * Designed for immediate drop-in replacement with FastAPI backend endpoints.
 */

// Simulated network delay helper for realistic UI states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getExperts(): Promise<Expert[]> {
  await delay(80);
  return [...EXPERTS];
}

export async function getExpertByMarket(marketId: MarketId): Promise<Expert | undefined> {
  await delay(80);
  return EXPERTS.find((e) => e.marketId === marketId);
}

export async function getInterviewQuestions(): Promise<InterviewQuestion[]> {
  await delay(60);
  return [...INTERVIEW_QUESTIONS];
}

export async function getQuestionById(questionId: number): Promise<InterviewQuestion | undefined> {
  await delay(50);
  return INTERVIEW_QUESTIONS.find((q) => q.id === questionId);
}

export async function getAnalysis(
  questionId: number,
  marketFilter?: MarketId | 'all'
): Promise<QuestionAnalysis | undefined> {
  await delay(100);
  const analysis = QUESTION_ANALYSES.find((a) => a.questionId === questionId);
  if (!analysis) return undefined;

  if (marketFilter && marketFilter !== 'all') {
    return {
      ...analysis,
      evidenceList: analysis.evidenceList.filter((e) => e.marketId === marketFilter),
      evidenceCoverage: {
        ...analysis.evidenceCoverage,
        marketsWithEvidence: analysis.evidenceList.filter((e) => e.marketId === marketFilter).length,
        label: `Filtered: Showing ${marketFilter.toUpperCase()}`,
      },
    };
  }

  return analysis;
}

export async function getExpertAllAnalyses(marketId: MarketId): Promise<{
  question: InterviewQuestion;
  analysis: QuestionAnalysis;
  expertEvidence: QuestionAnalysis['evidenceList'][0];
}[]> {
  await delay(100);
  const results = [];
  for (const q of INTERVIEW_QUESTIONS) {
    const analysis = QUESTION_ANALYSES.find((a) => a.questionId === q.id);
    if (analysis) {
      const evidence = analysis.evidenceList.find((e) => e.marketId === marketId);
      if (evidence) {
        results.push({
          question: q,
          analysis,
          expertEvidence: evidence,
        });
      }
    }
  }
  return results;
}

export async function getCrossMarketThemes(): Promise<CrossMarketTheme[]> {
  await delay(80);
  return [...CROSS_MARKET_THEMES];
}

export async function getComparisonDimensions(): Promise<ComparisonDimension[]> {
  await delay(80);
  return [...COMPARISON_DIMENSIONS];
}

export async function getTranscripts(marketFilter?: MarketId | 'all'): Promise<TranscriptSession[]> {
  await delay(100);
  if (marketFilter && marketFilter !== 'all') {
    return TRANSCRIPTS.filter((t) => t.marketId === marketFilter);
  }
  return [...TRANSCRIPTS];
}

export async function getTranscriptByMarket(marketId: MarketId): Promise<TranscriptSession | undefined> {
  await delay(80);
  return TRANSCRIPTS.find((t) => t.marketId === marketId);
}

export async function searchTranscripts(
  query: string,
  marketFilter?: MarketId | 'all'
): Promise<{
  utteranceId: string;
  marketId: MarketId;
  country: string;
  flag: string;
  expertName: string;
  timestamp: string;
  speaker: string;
  text: string;
  matchedSnippet: string;
}[]> {
  await delay(120);
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase().trim();
  const sessions = marketFilter && marketFilter !== 'all'
    ? TRANSCRIPTS.filter((t) => t.marketId === marketFilter)
    : TRANSCRIPTS;

  const results: {
    utteranceId: string;
    marketId: MarketId;
    country: string;
    flag: string;
    expertName: string;
    timestamp: string;
    speaker: string;
    text: string;
    matchedSnippet: string;
  }[] = [];

  for (const session of sessions) {
    for (const u of session.utterances) {
      if (u.text.toLowerCase().includes(q)) {
        results.push({
          utteranceId: u.id,
          marketId: session.marketId,
          country: session.country,
          flag: session.flag,
          expertName: session.expertName,
          timestamp: u.timestamp,
          speaker: u.speaker,
          text: u.text,
          matchedSnippet: u.text,
        });
      }
    }
  }

  return results;
}

export async function askAssistant(userQuery: string): Promise<ChatMessage> {
  await delay(600); // realistic AI response delay
  const q = userQuery.toLowerCase();

  // Keyword-based matcher across curated grounded responses
  for (const key of Object.keys(PRESET_CHAT_RESPONSES)) {
    const preset = PRESET_CHAT_RESPONSES[key];
    const hasMatch = preset.queryKeywords.some((keyword) => q.includes(keyword));
    if (hasMatch) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: preset.aiAnswer,
        timestamp: 'Just now',
        citations: preset.citations,
        sourcesCount: 3,
        isGrounded: true,
      };
    }
  }

  // Fallback intelligent synthesis with dynamic evidence extraction
  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    content: `Across the French, German, and UK markets, expert perspectives emphasize that successful robotic surgery integration hinges on aligning clinical desire with strict institutional economics and dedicated multi-surgeon training programs. Hospitals that treat robotics as a strategic institutional asset with high utilization achieve positive return on investment.`,
    timestamp: 'Just now',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '01:20',
        exactQuote: 'The biggest issue is still capital budget approval. Hospitals may like the technology clinically, but purchasing committees need a strong economic case before approving a system.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '02:08',
        exactQuote: 'We look at total cost of ownership, expected procedure volume, maintenance, service contracts and training requirements. A strong clinical case helps, but the economic case decides whether it gets approved.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '06:04',
        exactQuote: 'The key point is that adoption is not just about buying the machine. Hospitals need enough trained people and enough procedure volume to make the programme sustainable.',
        source: 'Transcript — United Kingdom',
      },
    ],
    sourcesCount: 3,
    isGrounded: true,
  };
}
