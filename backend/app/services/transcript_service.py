import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.schemas import (
    TranscriptUtterance,
    TranscriptSessionResponse,
    ExpertResponse,
    InterviewQuestionResponse,
    TranscriptSearchMatch,
)


class TranscriptService:
    def __init__(self):
        self.transcripts_dir = settings.transcripts_dir
        self.guide_dir = settings.interview_guide_dir
        self._cache: Dict[str, TranscriptSessionResponse] = {}
        self._questions_cache: List[InterviewQuestionResponse] = []
        self._load_transcripts()
        self._load_questions()

    def _load_transcripts(self):
        files_config = [
            ("Transcript_1_France.txt", "france", "France", "🇫🇷", "06:08", "February 12, 2026"),
            ("Transcript_2_Germany.txt", "germany", "Germany", "🇩🇪", "06:05", "February 15, 2026"),
            ("Transcript_3_UK.txt", "uk", "United Kingdom", "🇬🇧", "06:04", "February 18, 2026"),
        ]

        for filename, market, country, flag, duration, date in files_config:
            file_path = self.transcripts_dir / filename
            if not file_path.exists():
                continue

            session = self._parse_file(file_path, filename, market, country, flag, duration, date)
            if session:
                self._cache[market] = session

    def _parse_file(
        self,
        file_path: Path,
        filename: str,
        market: str,
        country: str,
        flag: str,
        duration: str,
        date: str,
    ) -> Optional[TranscriptSessionResponse]:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract header metadata
        expert_name = "Unknown Expert"
        expert_role = "Healthcare Expert"

        expert_match = re.search(r"Expert \d+\s*[–-]\s*(.+)", content)
        if expert_match:
            expert_name = expert_match.group(1).strip()

        role_match = re.search(r"Role:\s*(.+)", content)
        if role_match:
            expert_role = role_match.group(1).strip()

        # Regex to match timestamps and following speaker blocks:
        # e.g.:
        # 00:18
        # Dr. Martin: Adoption is growing...
        pattern = r"(\d{2}:\d{2})\s*\n\s*([^:\n]+):\s*([\s\S]+?)(?=(?:\n\s*\d{2}:\d{2}|\Z))"
        matches = re.findall(pattern, content)

        utterances: List[TranscriptUtterance] = []
        total_words = 0

        for idx, (timestamp, speaker, text) in enumerate(matches):
            clean_speaker = speaker.strip()
            clean_text = text.strip()
            # Clean internal extra newlines
            clean_text = re.sub(r"\s+", " ", clean_text)
            is_interviewer = clean_speaker.lower() == "interviewer"
            total_words += len(clean_text.split())

            utterances.append(
                TranscriptUtterance(
                    id=f"{market}-{idx + 1:02d}",
                    timestamp=timestamp.strip(),
                    speaker=clean_speaker,
                    is_interviewer=is_interviewer,
                    text=clean_text,
                    market=market,
                    expert_name=expert_name,
                    expert_role=expert_role,
                    source=filename,
                )
            )

        return TranscriptSessionResponse(
            market=market,
            country=country,
            flag=flag,
            expert_name=expert_name,
            expert_role=expert_role,
            duration=duration,
            date=date,
            word_count=total_words,
            utterances=utterances,
        )

    def _load_questions(self):
        guide_file = self.guide_dir / "Interview_Guide.txt"
        if not guide_file.exists():
            return

        with open(guide_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse numbered questions: 1. How would you describe...
        matches = re.findall(r"(\d+)\.\s*(.+)", content)

        category_map = {
            1: ("Current adoption", "Market Penetration", "Examine baseline penetration across academic and regional centres."),
            2: ("Barriers to adoption", "Market Friction", "Identify systemic hurdles across capital allocation and training."),
            3: ("Budgets & ROI", "Health Economics", "Analyze financial scrutiny, procedure volume requirements, and payback."),
            4: ("Training & clinical outcomes", "Clinical Operations", "Evaluate operational dependence on multi-surgeon proficiency and clinical efficacy."),
            5: ("3–5 year outlook", "Strategic Forecast", "Synthesize quantitative procedural volume forecasts over 3-5 years."),
            6: ("Purchase timeline", "Procurement Cycles", "Benchmark realistic capital acquisition timelines from clinical request to approval."),
        }

        self._questions_cache = []
        for num_str, full_q in matches:
            qid = int(num_str)
            short_title, cat, rationale = category_map.get(
                qid,
                (f"Question {qid}", "Robotic Surgery", "Research inquiry into European robotic surgery market.")
            )
            self._questions_cache.append(
                InterviewQuestionResponse(
                    id=qid,
                    short_title=short_title,
                    full_question=full_q.strip(),
                    category=cat,
                    research_rationale=rationale,
                )
            )

    def get_all_transcripts(self, market_filter: Optional[str] = None) -> List[TranscriptSessionResponse]:
        if market_filter and market_filter.lower() != "all":
            m = market_filter.lower()
            return [self._cache[m]] if m in self._cache else []
        return list(self._cache.values())

    def get_transcript_by_market(self, market: str) -> Optional[TranscriptSessionResponse]:
        return self._cache.get(market.lower())

    def get_all_experts(self) -> List[ExpertResponse]:
        experts_info = [
            {
                "id": "jean-martin",
                "name": "Dr. Jean Martin",
                "role": "Head of Urology",
                "market": "france",
                "country": "France",
                "flag": "🇫🇷",
                "interview_duration": "06:08",
                "total_insights": 6,
                "description": "Specializes in robotic-assisted urological oncology and surgical program leadership in major academic centres across France.",
                "strategic_stance": "Clinical excellence opens doors, but capital committees strictly require validated multi-surgeon throughput and ROI models before greenlighting systems.",
            },
            {
                "id": "anna-keller",
                "name": "Anna Keller",
                "role": "Former Hospital Procurement Director",
                "market": "germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "interview_duration": "06:05",
                "total_insights": 6,
                "description": "Expert in hospital capital budgeting, procurement alignment, medical device lifecycle valuation, and service contract negotiation across DACH healthcare systems.",
                "strategic_stance": "Capital acquisition is governed by Total Cost of Ownership (TCO) and procedural capacity. A strong clinical thesis must withstand strict budgetary governance.",
            },
            {
                "id": "emily-carter",
                "name": "Dr. Emily Carter",
                "role": "Consultant Urologist",
                "market": "uk",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "interview_duration": "06:04",
                "total_insights": 6,
                "description": "Lead robotic pelvic surgeon and clinical director leading surgical expansion programs and theatre staff training initiatives within the NHS.",
                "strategic_stance": "Technology investment is balanced between capital funding and human workforce capacity; sustainable adoption hinges on comprehensive theatre team training.",
            },
        ]
        return [ExpertResponse(**exp) for exp in experts_info]

    def get_interview_questions(self) -> List[InterviewQuestionResponse]:
        return self._questions_cache

    def search_transcripts(self, query: str, market_filter: Optional[str] = None) -> List[TranscriptSearchMatch]:
        q = query.lower().strip()
        if not q:
            return []

        results: List[TranscriptSearchMatch] = []
        sessions = self.get_all_transcripts(market_filter)

        for session in sessions:
            for u in session.utterances:
                if q in u.text.lower() or q in u.speaker.lower():
                    results.append(
                        TranscriptSearchMatch(
                            utterance_id=u.id,
                            market=session.market,
                            country=session.country,
                            flag=session.flag,
                            expert_name=session.expert_name,
                            timestamp=u.timestamp,
                            speaker=u.speaker,
                            text=u.text,
                            source=u.source,
                        )
                    )
        return results

    def get_chunks_for_ingestion(self) -> List[Dict[str, Any]]:
        """
        Creates semantic chunks from transcript utterances.
        Each chunk is focused on the expert's substantive response paired with
        the interviewer's preceding question for optimal retrieval context.
        Each chunk strictly preserves metadata:
        market, expert_name, expert_role, speaker, timestamp, source, text.
        """
        chunks: List[Dict[str, Any]] = []

        for session in self._cache.values():
            current_question = ""
            for u in session.utterances:
                if u.is_interviewer:
                    current_question = u.text
                    continue

                # This is an expert answer
                chunk_id = f"{session.market}_{u.timestamp.replace(':', '')}_{u.id}"
                
                # Contextual text for embedding (incorporating the question topic and expert response)
                context_prefix = (
                    f"Market: {session.country} | Expert: {session.expert_name} ({session.expert_role}) | "
                    f"Question: {current_question} | Response at {u.timestamp}: "
                )
                
                chunks.append({
                    "id": chunk_id,
                    "text": u.text,  # EXACT expert quote
                    "contextual_text": context_prefix + u.text,
                    "metadata": {
                        "market": session.country,
                        "market_id": session.market,
                        "expert_name": session.expert_name,
                        "expert_role": session.expert_role,
                        "speaker": u.speaker,
                        "is_interviewer": False,
                        "timestamp": u.timestamp,
                        "source": u.source,
                    }
                })

        return chunks


transcript_service = TranscriptService()
