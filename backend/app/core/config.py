import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "InsightLens AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Gemini LLM configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Embedding and Vector DB configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHROMA_PATH: str = "./chroma_db"
    CHROMA_COLLECTION: str = "insightlens_transcripts"

    # CORS configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Data paths resolved relative to project root
    @property
    def project_root(self) -> Path:
        return Path(__file__).resolve().parent.parent.parent.parent

    @property
    def transcripts_dir(self) -> Path:
        return self.project_root / "data" / "transcripts"

    @property
    def interview_guide_dir(self) -> Path:
        return self.project_root / "data" / "interview-guide"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
