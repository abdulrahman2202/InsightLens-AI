from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "healthy"


class ExpertResponse(BaseModel):
    id: str
    name: str
    role: str
    market: str
    country: str
    flag: str
    interview_duration: str
    total_insights: int
    description: Optional[str] = None
    strategic_stance: Optional[str] = None


class InterviewQuestionResponse(BaseModel):
    id: int
    short_title: str
    full_question: str
    category: str
    research_rationale: str


class SupportingEvidenceItem(BaseModel):
    market: str
    country: str
    flag: str
    expert_name: str
    expert_role: str
    timestamp: str
    exact_quote: str
    source: str
    ai_answer: str


class EvidenceCoverage(BaseModel):
    total_markets: int = 3
    markets_with_evidence: int = 3
    label: str = "Evidence found in 3 of 3 interviews"


class QuestionAnalysisResponse(BaseModel):
    question_id: int
    question: str
    ai_summary: str
    evidence_coverage: EvidenceCoverage
    evidence_list: List[SupportingEvidenceItem]


class TranscriptUtterance(BaseModel):
    id: str
    timestamp: str
    speaker: str
    is_interviewer: bool
    text: str
    market: str
    expert_name: str
    expert_role: str
    source: str


class TranscriptSessionResponse(BaseModel):
    market: str
    country: str
    flag: str
    expert_name: str
    expert_role: str
    duration: str
    date: str
    word_count: int
    utterances: List[TranscriptUtterance]


class TranscriptSearchMatch(BaseModel):
    utterance_id: str
    market: str
    country: str
    flag: str
    expert_name: str
    timestamp: str
    speaker: str
    text: str
    source: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question about European robotic surgery interviews")
    market: Optional[str] = Field(None, description="Optional market filter ('france', 'germany', 'uk')")


class ChatCitation(BaseModel):
    market: str
    expert_name: str
    timestamp: str
    quote: str
    source: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatCitation] = []


class IngestResponse(BaseModel):
    status: str
    chunks_indexed: int
    message: str
