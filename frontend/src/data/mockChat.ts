import { ChatMessage, ChatCitation } from '@/types';

export interface GroundedQueryResponse {
  queryKeywords: string[];
  aiAnswer: string;
  citations: ChatCitation[];
}

export const PRESET_CHAT_RESPONSES: Record<string, GroundedQueryResponse> = {
  barriers: {
    queryKeywords: ['barrier', 'obstacle', 'holding back', 'holding', 'hurdle', 'challenge', 'block', 'cost'],
    aiAnswer:
      'Across France, Germany, and the UK, capital budget approval and upfront acquisition cost are consistently identified as the primary barrier. However, experts distinguish between initial funding and operational sustainability: in Germany and France, proving procedural throughput and ROI is critical, while in the UK, theatre staffing and surgeon training capacity represent an equal bottleneck.',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '01:20',
        exactQuote:
          'The biggest issue is still capital budget approval. Hospitals may like the technology clinically, but purchasing committees need a strong economic case before approving a system.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '01:10',
        exactQuote:
          'Cost is the first barrier. These are large capital purchases, and hospital finances are under pressure. The second issue is proving that the system will be used enough.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '01:05',
        exactQuote:
          'Funding is important, but I would say training capacity is just as important. You can buy a system, but if you cannot train enough surgeons and theatre staff, adoption stalls.',
        source: 'Transcript — United Kingdom',
      },
    ],
  },
  roi: {
    queryKeywords: ['roi', 'budget', 'economics', 'financial', 'finance', 'pay for itself', 'procurement', 'cost'],
    aiAnswer:
      'Financial ROI and Total Cost of Ownership (TCO) are decisive in France and Germany, where finance directors and procurement committees require evidence that systems will amortize through procedure volume and manageable maintenance costs. In the UK, financial considerations are balanced alongside clinical strategy, reduced patient length of stay, and surgeon recruitment.',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '02:18',
        exactQuote:
          'Very important. The clinical argument may get surgeons interested, but the finance team wants to understand utilisation, procedure volume, maintenance cost and whether the system will actually pay for itself.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '02:08',
        exactQuote:
          'We look at total cost of ownership, expected procedure volume, maintenance, service contracts and training requirements. A strong clinical case helps, but the economic case decides whether it gets approved.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '02:07',
        exactQuote:
          'It matters, but the discussion is not always purely financial. Hospitals also consider patient outcomes, length of stay, surgeon recruitment and whether the technology improves their clinical position.',
        source: 'Transcript — United Kingdom',
      },
    ],
  },
  training: {
    queryKeywords: ['train', 'training', 'utilisation', 'utilization', 'single surgeon', 'nurse', 'theatre', 'staff'],
    aiAnswer:
      'Training is universally tied to program economics and clinical throughput. All three experts warn that if only a single surgeon is certified to operate the robot, procedure volume remains insufficient and the investment becomes economically unsustainable. Furthermore, UK expert Dr. Carter emphasizes that theatre nursing and support team training is equally vital.',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '03:10',
        exactQuote:
          'Training matters, especially in the first year. If only one surgeon can use the system, the economics become difficult. Hospitals want several surgeons trained so utilisation is high enough.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '03:05',
        exactQuote:
          'Very important operationally. If the hospital buys a system but only one surgeon is comfortable using it, utilisation will be poor. That weakens the business case.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '06:04',
        exactQuote:
          'The key point is that adoption is not just about buying the machine. Hospitals need enough trained people and enough procedure volume to make the programme sustainable.',
        source: 'Transcript — United Kingdom',
      },
    ],
  },
  timelines: {
    queryKeywords: ['timeline', 'decision', 'purchase', 'month', 'cycle', 'budget cycle', 'procure', 'how long'],
    aiAnswer:
      'Hospital purchasing decisions typically span 6 to 18 months across Europe. France averages 6 to 12 months, Germany spans 9 to 18 months due to multi-department alignment (procurement, clinical leadership, finance), and the UK averages 6 to 9 months if capital is pre-allocated, but significantly longer if bids must await annual NHS capital allocation cycles.',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '06:08',
        exactQuote:
          'Six to twelve months is realistic once the hospital becomes serious. It can be longer if the capital committee pushes the purchase into the next budget cycle.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '06:05',
        exactQuote:
          'Nine to eighteen months is common. Procurement, clinical leadership, finance and management all need to align, so it can move slowly.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '05:04',
        exactQuote:
          'Around six to nine months can happen if funding is already available. If the trust has to wait for a new capital cycle, it can take much longer.',
        source: 'Transcript — United Kingdom',
      },
    ],
  },
  growth: {
    queryKeywords: ['growth', 'outlook', 'future', 'trend', '3-5 year', 'years', 'forecast', 'accelerate', 'volume'],
    aiAnswer:
      'Experts anticipate steady, sustained procedural volume growth over the next 3 to 5 years rather than explosive nationwide adoption. In France and the UK, procedure volume expansion could reach 15% to 20% annually in active robotic centres, while Germany projects a more conservative high single-digit or low double-digit rate due to competing capital priorities.',
    citations: [
      {
        expertName: 'Dr. Jean Martin',
        marketId: 'france',
        country: 'France',
        flag: '🇫🇷',
        timestamp: '05:07',
        exactQuote:
          'I expect adoption to continue increasing, probably steadily rather than explosively. I would expect maybe 15 to 20 percent more procedures annually in some of the stronger centres, but smaller hospitals will remain slower.',
        source: 'Transcript — France',
      },
      {
        expertName: 'Anna Keller',
        marketId: 'germany',
        country: 'Germany',
        flag: '🇩🇪',
        timestamp: '05:08',
        exactQuote:
          'I would expect continued growth, but probably closer to high single digits or low double digits in procedure volumes rather than something like 20 percent across the whole market.',
        source: 'Transcript — Germany',
      },
      {
        expertName: 'Dr. Emily Carter',
        marketId: 'uk',
        country: 'United Kingdom',
        flag: '🇬🇧',
        timestamp: '04:06',
        exactQuote:
          'I am quite positive. I think adoption could accelerate if training expands and systems become more cost competitive. I could see procedure growth above 15 percent annually in some areas.',
        source: 'Transcript — United Kingdom',
      },
    ],
  },
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    content:
      'Welcome to the InsightLens Research Assistant. I synthesize findings across expert interviews in France, Germany, and the United Kingdom on European robotic surgery adoption. Every statement I provide is directly linked to transcript evidence with timestamps. How can I assist your research today?',
    timestamp: 'Just now',
    isGrounded: true,
  },
];

export const SUGGESTED_QUESTIONS = [
  'What are the main barriers to adoption?',
  'How important is ROI in purchasing decisions?',
  'How does training affect utilisation?',
  'How do purchase timelines differ across markets?',
  'Compare growth expectations over the next 3–5 years.',
];
