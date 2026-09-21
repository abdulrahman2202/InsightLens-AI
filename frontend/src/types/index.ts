export type MarketId = 'france' | 'germany' | 'uk';

export interface Expert {
  id: string;
  name: string;
  role: string;
  institution?: string;
  marketId: MarketId;
  country: string;
  flag: string;
  interviewDuration: string;
  avatarUrl: string;
  description: string;
  strategicStance: string;
  keyThemes: string[];
  totalInsights: number;
}

export interface InterviewQuestion {
  id: number;
  shortTitle: string;
  fullQuestion: string;
  category: string;
  researchRationale: string;
}

export interface SupportingEvidence {
  expertId: string;
  expertName: string;
  expertRole: string;
  marketId: MarketId;
  country: string;
  flag: string;
  aiAnswer: string;
  exactQuote: string;
  timestamp: string;
  source: string;
  sourceTranscriptUrl: string;
}

export interface QuestionAnalysis {
  questionId: number;
  aiSummary: string;
  evidenceCoverage: {
    totalMarkets: number;
    marketsWithEvidence: number;
    label: string;
  };
  evidenceList: SupportingEvidence[];
}

export interface ThemeEvidence {
  marketId: MarketId;
  country: string;
  flag: string;
  expertName: string;
  timestamp: string;
  quote: string;
}

export interface CrossMarketTheme {
  id: string;
  number: number;
  title: string;
  shortExplanation: string;
  markets: MarketId[];
  evidenceCount: number;
  evidence: ThemeEvidence[];
}

export interface ComparisonDimension {
  dimension: string;
  category: string;
  france: {
    summary: string;
    quoteSnippet: string;
    timestamp: string;
  };
  germany: {
    summary: string;
    quoteSnippet: string;
    timestamp: string;
  };
  uk: {
    summary: string;
    quoteSnippet: string;
    timestamp: string;
  };
}

export interface TranscriptUtterance {
  id: string;
  timestamp: string;
  speaker: string;
  isInterviewer: boolean;
  text: string;
  relatedQuestionId?: number;
}

export interface TranscriptSession {
  marketId: MarketId;
  country: string;
  flag: string;
  expertName: string;
  expertRole: string;
  duration: string;
  date: string;
  wordCount: number;
  utterances: TranscriptUtterance[];
}

export interface ChatCitation {
  expertName: string;
  marketId: MarketId;
  country: string;
  flag: string;
  timestamp: string;
  exactQuote: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatCitation[];
  sourcesCount?: number;
  isGrounded?: boolean;
}
