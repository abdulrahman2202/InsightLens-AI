from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import analysis, transcripts, chat
from app.services.vector_service import vector_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure vector DB collection is ready
    try:
        if vector_service.get_count() == 0:
            vector_service.ingest_transcripts()
    except Exception as e:
        print(f"Warning: Failed initial auto-ingestion on startup: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Evidence-grounded RAG API for European robotic surgery market intelligence.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(analysis.router, prefix=settings.API_V1_PREFIX)
app.include_router(transcripts.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "health": f"{settings.API_V1_PREFIX}/health",
            "experts": f"{settings.API_V1_PREFIX}/experts",
            "questions": f"{settings.API_V1_PREFIX}/questions",
            "analysis": f"{settings.API_V1_PREFIX}/analysis/1",
            "transcripts": f"{settings.API_V1_PREFIX}/transcripts",
            "chat": f"{settings.API_V1_PREFIX}/chat",
            "ingest": f"{settings.API_V1_PREFIX}/ingest"
        }
    }


@app.get("/health")
def root_health():
    return {"status": "healthy"}