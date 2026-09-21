import { Expert } from '@/types';

export const EXPERTS: Expert[] = [
  {
    id: 'jean-martin',
    name: 'Dr. Jean Martin',
    role: 'Head of Urology',
    institution: 'Centre Hospitalier Universitaire',
    marketId: 'france',
    country: 'France',
    flag: '🇫🇷',
    interviewDuration: '06:08',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    description: 'Specializes in robotic-assisted urological oncology and surgical program leadership in major academic centres across France.',
    strategicStance: 'Clinical excellence opens doors, but capital committees strictly require validated multi-surgeon throughput and ROI models before greenlighting systems.',
    keyThemes: ['Academic Concentration', 'Capital Committee Scrutiny', 'Surgeon Multi-Training', 'Steady 15-20% Growth'],
    totalInsights: 6,
  },
  {
    id: 'anna-keller',
    name: 'Anna Keller',
    role: 'Former Hospital Procurement Director',
    institution: 'German Hospital Network Alliance',
    marketId: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    interviewDuration: '06:05',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    description: 'Expert in hospital capital budgeting, procurement alignment, medical device lifecycle valuation, and service contract negotiation across DACH healthcare systems.',
    strategicStance: 'Capital acquisition is governed by Total Cost of Ownership (TCO) and procedural capacity. A strong clinical thesis must withstand strict budgetary governance.',
    keyThemes: ['Procurement Realism', 'Total Cost of Ownership', 'Service Contracts', '9-18 Month Approval Cycles'],
    totalInsights: 6,
  },
  {
    id: 'emily-carter',
    name: 'Dr. Emily Carter',
    role: 'Consultant Urologist',
    institution: 'NHS Foundation Trust',
    marketId: 'uk',
    country: 'United Kingdom',
    flag: '🇬🇧',
    interviewDuration: '06:04',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813626-d6676a0a09bc?auto=format&fit=crop&w=400&q=80',
    description: 'Lead robotic pelvic surgeon and clinical director leading surgical expansion programs and theatre staff training initiatives within the NHS.',
    strategicStance: 'Technology investment is balanced between capital funding and human workforce capacity; sustainable adoption hinges on comprehensive theatre team training.',
    keyThemes: ['NHS Adoption Disparity', 'Staff & Theatre Training', 'Length of Stay Metrics', 'Strategic Clinical Position'],
    totalInsights: 6,
  },
];

export const getExpertById = (id: string): Expert | undefined => {
  return EXPERTS.find((e) => e.id === id || e.marketId === id);
};

export const getExpertByMarket = (marketId: string): Expert | undefined => {
  return EXPERTS.find((e) => e.marketId === marketId);
};
