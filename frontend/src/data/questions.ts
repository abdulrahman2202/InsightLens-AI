import { InterviewQuestion } from '@/types';

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    shortTitle: 'Current adoption',
    fullQuestion: 'How would you describe current adoption of robotic surgery in your market?',
    category: 'Market Penetration',
    researchRationale: 'Examine current baseline penetration, procedural maturity, and the distribution curve between leading tertiary/academic centres versus regional hospitals.',
  },
  {
    id: 2,
    shortTitle: 'Barriers to adoption',
    fullQuestion: 'What are the main barriers to adoption?',
    category: 'Market Friction',
    researchRationale: 'Identify systemic hurdles across capital rationing, committee approvals, operational bottlenecks, and capacity constraints across European health economies.',
  },
  {
    id: 3,
    shortTitle: 'Budgets & ROI',
    fullQuestion: 'How important are hospital budgets and ROI in purchasing decisions?',
    category: 'Health Economics',
    researchRationale: 'Analyze how financial scrutiny, total cost of ownership (TCO), procedure volume requirements, and fiscal payback influence final purchasing committee approvals.',
  },
  {
    id: 4,
    shortTitle: 'Training & clinical outcomes',
    fullQuestion: 'How important are surgeon training and clinical outcomes?',
    category: 'Clinical Operations',
    researchRationale: 'Evaluate the operational dependence on multi-surgeon proficiency, theatre nursing competency, and the comparative value of clinical outcomes vs financial returns.',
  },
  {
    id: 5,
    shortTitle: '3–5 year outlook',
    fullQuestion: 'What adoption trend do you expect over the next 3–5 years?',
    category: 'Strategic Forecast',
    researchRationale: 'Synthesize quantitative procedure volume expectations, expansion trajectories, and structural tailwinds across French, German, and UK hospital environments.',
  },
  {
    id: 6,
    shortTitle: 'Purchase timeline',
    fullQuestion: 'What is the typical hospital decision-making timeline for purchasing a new robotic system?',
    category: 'Procurement Cycles',
    researchRationale: 'Benchmark realistic capital evaluation cycles from clinical request through committee alignment, tenders, and multi-stakeholder governance approval.',
  },
];

export const getQuestionById = (id: number): InterviewQuestion | undefined => {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
};
