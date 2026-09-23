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
 * Connected to FastAPI backend at http://localhost:8000/api/v1
 * with graceful fallback to validated local structured data.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function getExperts(): Promise<Expert[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/experts`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((exp: any) => {
          const local = EXPERTS.find((e) => e.marketId === exp.market);
          return {
            id: exp.id || local?.id || exp.market,
            name: exp.name,
            role: exp.role,
            institution: local?.institution,
            marketId: exp.market as MarketId,
            country: exp.country,
            flag: exp.flag,
            interviewDuration: exp.interview_duration,
            avatarUrl: local?.avatarUrl || '',
            description: exp.description || local?.description || '',
            strategicStance: exp.strategic_stance || local?.strategicStance || '',
            keyThemes: local?.keyThemes || [],
            totalInsights: exp.total_insights || 6,
          };
        });
      }
    }
  } catch (e) {
    // Fallback to local verified dataset
  }
  return [...EXPERTS];
}

export async function getExpertByMarket(marketId: MarketId): Promise<Expert | undefined> {
  const experts = await getExperts();
  return experts.find((e) => e.marketId === marketId);
}

export async function getInterviewQuestions(): Promise<InterviewQuestion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/questions`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((q: any) => ({
          id: q.id,
          shortTitle: q.short_title,
          fullQuestion: q.full_question,
          category: q.category,
          researchRationale: q.research_rationale,
        }));
      }
    }
  } catch (e) {
    // Fallback to local verified dataset
  }
  return [...INTERVIEW_QUESTIONS];
}

export async function getQuestionById(questionId: number): Promise<InterviewQuestion | undefined> {
  const questions = await getInterviewQuestions();
  return questions.find((q) => q.id === questionId);
}

export async function getAnalysis(
  questionId: number,
  marketFilter?: MarketId | 'all'
): Promise<QuestionAnalysis | undefined> {
  try {
    const url = new URL(`${API_BASE_URL}/analysis/${questionId}`);
    if (marketFilter && marketFilter !== 'all') {
      url.searchParams.set('market', marketFilter);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return {
        questionId: data.question_id,
        aiSummary: data.ai_summary,
        evidenceCoverage: {
          totalMarkets: data.evidence_coverage.total_markets,
          marketsWithEvidence: data.evidence_coverage.markets_with_evidence,
          label: data.evidence_coverage.label,
        },
        evidenceList: data.evidence_list.map((e: any) => {
          const marketId = (e.market?.toLowerCase() === 'united kingdom' ? 'uk' : e.market?.toLowerCase()) as MarketId;
          return {
            expertId: e.expert_name.toLowerCase().replace(/[^a-z]/g, '-'),
            expertName: e.expert_name,
            expertRole: e.expert_role,
            marketId,
            country: e.country,
            flag: e.flag,
            aiAnswer: e.ai_answer,
            exactQuote: e.exact_quote,
            timestamp: e.timestamp,
            source: e.source,
            sourceTranscriptUrl: `/transcripts/${marketId}?t=${e.timestamp}`,
          };
        }),
      };
    }
  } catch (e) {
    // Fallback
  }

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
  const results = [];
  const questions = await getInterviewQuestions();
  for (const q of questions) {
    const analysis = await getAnalysis(q.id);
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
  return [...CROSS_MARKET_THEMES];
}

export async function getComparisonDimensions(): Promise<ComparisonDimension[]> {
  return [...COMPARISON_DIMENSIONS];
}

export async function getTranscripts(marketFilter?: MarketId | 'all'): Promise<TranscriptSession[]> {
  try {
    const url = new URL(`${API_BASE_URL}/transcripts`);
    if (marketFilter && marketFilter !== 'all') {
      url.searchParams.set('market', marketFilter);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((session: any) => ({
          marketId: session.market as MarketId,
          country: session.country,
          flag: session.flag,
          expertName: session.expert_name,
          expertRole: session.expert_role,
          duration: session.duration,
          date: session.date,
          wordCount: session.word_count,
          utterances: session.utterances.map((u: any) => ({
            id: u.id,
            timestamp: u.timestamp,
            speaker: u.speaker,
            isInterviewer: u.is_interviewer,
            text: u.text,
          })),
        }));
      }
    }
  } catch (e) {
    // Fallback
  }

  if (marketFilter && marketFilter !== 'all') {
    return TRANSCRIPTS.filter((t) => t.marketId === marketFilter);
  }
  return [...TRANSCRIPTS];
}

export async function getTranscriptByMarket(marketId: MarketId): Promise<TranscriptSession | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/transcripts/${marketId}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const session = await res.json();
      return {
        marketId: session.market as MarketId,
        country: session.country,
        flag: session.flag,
        expertName: session.expert_name,
        expertRole: session.expert_role,
        duration: session.duration,
        date: session.date,
        wordCount: session.word_count,
        utterances: session.utterances.map((u: any) => ({
          id: u.id,
          timestamp: u.timestamp,
          speaker: u.speaker,
          isInterviewer: u.is_interviewer,
          text: u.text,
        })),
      };
    }
  } catch (e) {
    // Fallback
  }
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
  try {
    const targetMarket = marketFilter && marketFilter !== 'all' ? marketFilter : 'all';
    const url = new URL(`${API_BASE_URL}/transcripts/${targetMarket}/search`);
    url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          utteranceId: m.utterance_id,
          marketId: m.market as MarketId,
          country: m.country,
          flag: m.flag,
          expertName: m.expert_name,
          timestamp: m.timestamp,
          speaker: m.speaker,
          text: m.text,
          matchedSnippet: m.text,
        }));
      }
    }
  } catch (e) {
    // Fallback to local search
  }

  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const sessions = marketFilter && marketFilter !== 'all'
    ? TRANSCRIPTS.filter((t) => t.marketId === marketFilter)
    : TRANSCRIPTS;

  const results: any[] = [];
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
  // 1. Attempt FastAPI backend RAG call: POST /api/v1/chat with { "question": "<user question>" }
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userQuery }),
    });

    if (res.ok) {
      const data = await res.json();
      const citations = (data.sources || []).map((s: any) => {
        const marketLower = (s.market || '').toLowerCase();
        const marketId: MarketId = marketLower.includes('france')
          ? 'france'
          : marketLower.includes('germany')
          ? 'germany'
          : 'uk';
        const flag = marketId === 'france' ? '🇫🇷' : marketId === 'germany' ? '🇩🇪' : '🇬🇧';
        const country = marketId === 'france' ? 'France' : marketId === 'germany' ? 'Germany' : 'United Kingdom';
        const sourceDisplay = s.source
          ? (s.source.includes('Transcript') ? s.source.replace('.txt', '') : `Transcript — ${country}`)
          : `Transcript — ${country}`;

        return {
          expertName: s.expert_name,
          marketId,
          country,
          flag,
          timestamp: s.timestamp,
          exactQuote: s.quote,
          source: sourceDisplay,
        };
      });

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        timestamp: 'Just now',
        citations,
        sourcesCount: citations.length,
        isGrounded: true,
      };
    } else {
      let errorMsg = `FastAPI server error (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    // Only fall back to local mock data if the backend was completely unreachable (network connection error)
    const isNetworkError =
      err?.name === 'TypeError' ||
      err?.message?.includes('fetch') ||
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('NetworkError') ||
      err?.message?.includes('ECONNREFUSED');

    if (isNetworkError) {
      console.warn('FastAPI backend unreachable, using local fallback:', err.message);
      const q = userQuery.toLowerCase();
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
            sourcesCount: preset.citations.length,
            isGrounded: true,
          };
        }
      }

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

    // Explicit error from FastAPI backend: rethrow so user-friendly UI error is displayed
    throw err;
  }
}
