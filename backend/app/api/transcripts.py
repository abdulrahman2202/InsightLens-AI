from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import TranscriptSessionResponse, TranscriptSearchMatch
from app.services.transcript_service import transcript_service

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])


@router.get("", response_model=List[TranscriptSessionResponse])
def list_transcripts(market: Optional[str] = Query(None, description="Filter by market: 'france', 'germany', 'uk'")):
    return transcript_service.get_all_transcripts(market)


@router.get("/{market}", response_model=TranscriptSessionResponse)
def get_transcript(market: str):
    session = transcript_service.get_transcript_by_market(market)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript for market '{market}' not found. Valid markets: 'france', 'germany', 'uk'."
        )
    return session


@router.get("/{market}/search", response_model=List[TranscriptSearchMatch])
def search_market_transcript(
    market: str,
    q: str = Query(..., min_length=1, description="Search query string")
):
    market_filter = None if market.lower() == "all" else market.lower()
    matches = transcript_service.search_transcripts(query=q, market_filter=market_filter)
    return matches
