from fastapi import FastAPI

app = FastAPI(
    title="InsightLens AI",
    description="AI-powered expert interview intelligence platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "InsightLens AI API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }