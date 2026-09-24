import logging
import random
import re
import time
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.config import settings
from app.models.schemas import ChatResponse, ChatCitation
from app.services.vector_service import vector_service

logger = logging.getLogger(__name__)

# Transient error definitions for Gemini API
TRANSIENT_STATUS_CODES = {503, 429, 500, 504}
TRANSIENT_STATUS_NAMES = {"UNAVAILABLE", "RESOURCE_EXHAUSTED", "INTERNAL", "DEADLINE_EXCEEDED"}
NON_RETRYABLE_STATUS_CODES = {400, 401, 403, 404}
NON_RETRYABLE_STATUS_NAMES = {"INVALID_ARGUMENT", "UNAUTHENTICATED", "PERMISSION_DENIED", "NOT_FOUND"}

QUOTA_EXHAUSTION_PATTERNS = [
    "you exceeded your current quota",
    "generate_content_free_tier_requests",
    "quotafailure",
    "quota exceeded",
    "free_tier_requests",
    "quota_exhausted",
    "check your plan and billing details",
]


def is_quota_exhausted_error(e: Exception) -> bool:
    """
    Detects if an error represents quota exhaustion rather than a brief rate-limit spike.
    Matches:
    - 'You exceeded your current quota'
    - 'generate_content_free_tier_requests'
    - 'QuotaFailure'
    - 'Quota exceeded'
    """
    err_text = str(e).lower()
    msg = getattr(e, "message", None)
    if msg and isinstance(msg, str):
        err_text += " " + msg.lower()

    for pattern in QUOTA_EXHAUSTION_PATTERNS:
        if pattern in err_text:
            return True

    return False


def is_transient_error(e: Exception) -> bool:
    """
    Determines if a Gemini API failure is transient and retryable.
    Retryable: 503 UNAVAILABLE, normal transient 429 RESOURCE_EXHAUSTED (rate limits), 500 INTERNAL, 504 DEADLINE_EXCEEDED.
    Non-retryable: quota-exhausted 429, 400, 401, 403, 404, invalid API key/configuration errors.
    """
    # Permanent / free-tier quota exhaustion must NEVER be retried
    if is_quota_exhausted_error(e):
        return False

    code = getattr(e, "code", None)
    if code is None and hasattr(e, "status_code"):
        code = getattr(e, "status_code", None)

    status_str = str(getattr(e, "status", "")).upper()
    err_msg = str(e).upper()

    # Explicit non-retryable checks
    if code in NON_RETRYABLE_STATUS_CODES:
        return False
    if any(name in status_str for name in NON_RETRYABLE_STATUS_NAMES):
        return False
    if any(k in err_msg for k in ["API_KEY_INVALID", "INVALID API KEY", "API KEY NOT VALID", "PERMISSION DENIED"]):
        return False

    # Explicit transient checks
    if code in TRANSIENT_STATUS_CODES:
        return True
    if any(name in status_str for name in TRANSIENT_STATUS_NAMES):
        return True
    if any(term in err_msg for term in ["503", "429", "500", "504", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "DEADLINE_EXCEEDED"]):
        return True

    return False


SYSTEM_INSTRUCTION = """You are an evidence-grounded research assistant for InsightLens AI, an expert interview intelligence platform.
Your role is to answer questions about the European robotic surgery market strictly and solely based on the provided transcript evidence.

CRITICAL RULES:
1. Answer ONLY using facts directly stated in the provided evidence.
2. Do NOT extrapolate, speculate, or introduce outside knowledge.
3. Reference which evidence items support each part of your synthesis by including the tag [Evidence X] where X is the item number.
4. If the provided evidence does not contain sufficient information to answer the question, or if the question is off-topic, output EXACTLY AND ONLY:
Insufficient evidence in the provided transcripts.
5. Do NOT invent, paraphrase, or hallucinate quotes. Exact quote citations will be attached directly from source records.
"""


class RAGService:
    def __init__(self):
        self._genai_client = None

    def get_client(self) -> genai.Client:
        api_key = settings.GEMINI_API_KEY.strip()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env"
            )
        if self._genai_client is None:
            self._genai_client = genai.Client(api_key=api_key)
        return self._genai_client

    def answer_question(
        self,
        query: str,
        market_filter: Optional[str] = None,
        top_k: int = 5
    ) -> ChatResponse:
        clean_query = query.strip()
        if not clean_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question query cannot be empty."
            )

        # 1. Retrieve relevant transcript chunks from ChromaDB
        retrieved_chunks = vector_service.retrieve_relevant_chunks(
            query=clean_query,
            top_k=top_k,
            market_filter=market_filter
        )

        # Check retrieval relevance
        if not retrieved_chunks:
            return ChatResponse(
                answer="Insufficient evidence in the provided transcripts.",
                sources=[]
            )

        # If best similarity is extremely low (< 0.20), the query is likely unrelated
        best_similarity = max(c["similarity"] for c in retrieved_chunks)
        if best_similarity < 0.20:
            return ChatResponse(
                answer="Insufficient evidence in the provided transcripts.",
                sources=[]
            )

        # 2. Build context for Gemini
        context_parts = []
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            meta = chunk["metadata"]
            context_parts.append(
                f"[Evidence {idx}]\n"
                f"Market: {meta.get('market', 'Unknown')}\n"
                f"Expert: {meta.get('expert_name', 'Unknown')} ({meta.get('expert_role', '')})\n"
                f"Speaker: {meta.get('speaker', '')}\n"
                f"Timestamp: {meta.get('timestamp', '')}\n"
                f"Source: {meta.get('source', '')}\n"
                f"Transcript Text: {chunk['text']}\n"
            )

        evidence_context = "\n".join(context_parts)
        user_prompt = (
            f"Question: {clean_query}\n\n"
            f"Provided Transcript Evidence:\n"
            f"{evidence_context}\n\n"
            f"Synthesize an evidence-grounded answer citing the relevant [Evidence X] tags. "
            f"If the evidence does not adequately answer the question, state: 'Insufficient evidence in the provided transcripts.'"
        )

        # 3. Generate answer using Gemini with exponential backoff and jitter
        client = self.get_client()
        raw_answer = ""
        last_err = None
        max_retries = 3  # 3 retries after the initial request -> 4 total attempts maximum
        total_attempts = max_retries + 1

        for attempt in range(total_attempts):
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.1,
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                    )
                )
                raw_answer = response.text.strip() if response.text else ""
                last_err = None
                break
            except Exception as e:
                last_err = e
                # 1. Detect quota-exhaustion 429 errors separately from normal rate limits: DO NOT RETRY
                if is_quota_exhausted_error(e):
                    logger.error("Gemini API quota exhausted (non-retryable): %s", e)
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="The AI service quota is currently exhausted. Please try again later."
                    )

                # Check if transient error
                if not is_transient_error(e):
                    logger.error(
                        "Non-retryable error during Gemini generate_content on attempt %d/%d: %s",
                        attempt + 1,
                        total_attempts,
                        e,
                        exc_info=True,
                    )
                    break

                if attempt < max_retries:
                    # Exponential backoff: attempt 0 -> ~2s, attempt 1 -> ~4s, attempt 2 -> ~8s
                    base_delay = 2.0 * (2 ** attempt)
                    jitter = random.uniform(0.1, 0.5)
                    delay = base_delay + jitter
                    logger.warning(
                        "Transient Gemini API failure on attempt %d/%d (%s). Retrying in %.2fs (with jitter)...",
                        attempt + 1,
                        total_attempts,
                        e,
                        delay,
                    )
                    time.sleep(delay)
                else:
                    logger.error(
                        "Exhausted all %d attempts for Gemini generate_content. Final transient error: %s",
                        total_attempts,
                        e,
                        exc_info=True,
                    )

        # 4. Handle failure if all attempts failed or non-retryable error encountered
        if last_err is not None and not raw_answer:
            logger.error("Gemini API generation failed permanently: %s", last_err, exc_info=True)
            if is_quota_exhausted_error(last_err):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="The AI service quota is currently exhausted. Please try again later."
                )
            if getattr(last_err, "code", None) == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request to AI service."
                )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI service is temporarily unavailable. Please try again in a moment."
            )

        # 5. Check for insufficient evidence response from LLM
        if (
            not raw_answer
            or "insufficient evidence in the provided transcripts" in raw_answer.lower()
            or raw_answer.strip().lower().startswith("insufficient evidence")
        ):
            return ChatResponse(
                answer="Insufficient evidence in the provided transcripts.",
                sources=[]
            )

        # 6. Extract citations: strictly using the original transcript text from ChromaDB
        # Detect which [Evidence X] tags were referenced
        cited_indices = set()
        for match in re.finditer(r"\[Evidence\s*(\d+)\]", raw_answer, re.IGNORECASE):
            try:
                idx = int(match.group(1))
                if 1 <= idx <= len(retrieved_chunks):
                    cited_indices.add(idx - 1)
            except ValueError:
                pass

        # If no explicit tags were found, use the top relevant chunks that meet high similarity
        if not cited_indices:
            for idx, c in enumerate(retrieved_chunks):
                if c["similarity"] >= 0.40 and not c["metadata"].get("is_interviewer", False):
                    cited_indices.add(idx)

        # Deduplicate and format citations directly from the original chunk text
        citations: List[ChatCitation] = []
        seen_citations = set()

        for idx in sorted(cited_indices):
            chunk = retrieved_chunks[idx]
            meta = chunk["metadata"]
            
            # Skip interviewer utterances from the final evidence quotes if possible
            if meta.get("is_interviewer", False) and len(cited_indices) > 1:
                continue

            unique_key = (meta.get("expert_name"), meta.get("timestamp"))
            if unique_key in seen_citations:
                continue
            seen_citations.add(unique_key)

            citations.append(
                ChatCitation(
                    market=meta.get("market", "Unknown"),
                    expert_name=meta.get("expert_name", "Unknown"),
                    timestamp=meta.get("timestamp", "00:00"),
                    quote=chunk["text"],  # STRICT: verbatim from ChromaDB, NOT from Gemini!
                    source=meta.get("source", ""),
                )
            )

        # Clean any remaining internal bracket tags like [Evidence 1] for a polished answer
        clean_answer = re.sub(r"\[Evidence\s*\d+\]", "", raw_answer).strip()
        # Clean up double spaces or awkward punctuation left after removing tags
        clean_answer = re.sub(r"\s{2,}", " ", clean_answer)
        clean_answer = re.sub(r"\s+([,\.\?!])", r"\1", clean_answer)

        return ChatResponse(
            answer=clean_answer,
            sources=citations
        )


rag_service = RAGService()
