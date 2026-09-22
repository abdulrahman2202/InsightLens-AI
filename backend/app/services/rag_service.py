import re
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.config import settings
from app.models.schemas import ChatResponse, ChatCitation
from app.services.vector_service import vector_service


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

        # 3. Generate answer using Gemini
        client = self.get_client()
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.1,
                )
            )
            raw_answer = response.text.strip() if response.text else ""
        except APIError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating answer: {str(e)}"
            )

        # 4. Check for insufficient evidence response from LLM
        if (
            not raw_answer
            or "insufficient evidence in the provided transcripts" in raw_answer.lower()
            or raw_answer.strip().lower().startswith("insufficient evidence")
        ):
            return ChatResponse(
                answer="Insufficient evidence in the provided transcripts.",
                sources=[]
            )

        # 5. Extract citations: strictly using the original transcript text from ChromaDB
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
