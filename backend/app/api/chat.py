from fastapi import APIRouter, status
from app.models.schemas import ChatRequest, ChatResponse, IngestResponse
from app.services.rag_service import rag_service
from app.services.vector_service import vector_service

router = APIRouter(tags=["RAG Assistant & Ingestion"])


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_with_assistant(request: ChatRequest):
    """
    RAG-powered conversational endpoint.
    Retrieves evidence chunks from ChromaDB and prompts Gemini under strict grounding rules.
    Every citation contains the exact verbatim transcript chunk text stored in ChromaDB.
    """
    return rag_service.answer_question(
        query=request.question,
        market_filter=request.market
    )


@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_200_OK)
def trigger_ingestion():
    """
    Triggers or refreshes transcript ingestion into ChromaDB collection.
    Idempotent operation that preserves all timestamp and speaker metadata.
    """
    count = vector_service.ingest_transcripts(force=True)
    return IngestResponse(
        status="success",
        chunks_indexed=count,
        message=f"Successfully indexed {count} transcript dialogue chunks into ChromaDB collection."
    )
