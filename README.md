# InsightLens AI

> **AI-Powered Expert Interview Intelligence Platform**  
> *"Turn expert interviews into evidence-backed insights."*

InsightLens AI is an enterprise-grade qualitative intelligence platform that analyzes expert interview transcripts across European healthcare markets (**France**, **Germany**, and the **United Kingdom**) focusing on surgical robotics adoption. 

The platform bridges the gap between raw interview transcripts and executive decision-making. Researchers, health economists, and hospital executives can explore verbatim dialogues, compare cross-market dynamics, inspect standardized interview guide inquiries, and query the entire corpus using an evidence-grounded Retrieval-Augmented Generation (RAG) assistant with 100% citation provenance.

---

## 1. Key Features

- **Multi-Market Expert Coverage**: Full coverage of 3 distinct European healthcare systems:
  - 🇫🇷 **France**: Public hospital procurement committees (AP-HP), centralized capital budgets, and TCO evaluations.
  - 🇩🇪 **Germany**: DRG/G-BA reimbursement gaps, private hospital group dynamics, and case-volume thresholds.
  - 🇬🇧 **United Kingdom**: NHS Trust business cases, regional robotics networks, and theatre staffing/training bottlenecks.
- **Standardized Interview Guide Synthesis**: Direct, cross-expert answers across 6 core market access questions (adoption barriers, ROI, decision criteria, clinical specialties, procurement timelines, and market outlook) complete with coverage metrics and supporting quotes.
- **Cross-Market Comparison Matrix**: Interactive side-by-side thematic grid highlighting key agreements, structural divergences, and country-specific timelines.
- **Deep-Linked Transcript Explorer**: Full-text searchable transcript viewer with speaker tagging, role identification, and millisecond-accurate timestamp markers (`00:00`, `01:20`, etc.).
- **Ask InsightLens (Evidence-Grounded RAG)**: Conversational research assistant powered by Google Gemini, featuring custom Markdown normalization, citation count metrics, and evidence cards.
- **Zero Hallucinated Quotes**: Absolute citation integrity guarantee—citations and exact quotes are extracted verbatim from ChromaDB source chunks, never fabricated or paraphrased by the LLM.
- **Interactive Deep Linking**: Clicking any evidence citation navigates to the exact transcript dialogue, automatically scrolling to and highlighting the source quote.

---

## 2. Architecture & Tech Stack

```
                        Transcript Files (FR, DE, UK)
                                     ↓
                             Transcript Parser
                                     ↓
                       Structured Utterance Records
               (market, expert, role, speaker, timestamp)
                                     ↓
                        Contextual Semantic Chunking
               (question context + expert response pairing)
                                     ↓
                       SentenceTransformer Embeddings
                     (all-MiniLM-L6-v2, 384 dimensions)
                                     ↓
                          ChromaDB Vector Database
                  (collection: insightlens_transcripts)
                                     ↓
                         Cosine Semantic Retrieval
                       (top-k retrieval with metadata)
                                     ↓
                        Context Assembly & Prompting
                                     ↓
                           Google Gemini API
                   (gemini-3.5-flash, strict grounding)
                                     ↓
                        Evidence-Grounded Synthesis
            (verbatim chunk quotes attached directly from ChromaDB)
                                     ↓
                            FastAPI REST API
                         (http://localhost:8000)
                                     ↓
                          Next.js 16 UI Frontend
                         (http://localhost:3000)
```

### Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, ReactMarkdown | Fast, server-rendered SaaS dashboard with responsive design, rich typography, and dynamic Markdown rendering. |
| **Backend API** | FastAPI, Pydantic v2, Uvicorn, Python 3.10+ | High-performance asynchronous REST API with strict type validation and automatic OpenAPI/Swagger documentation. |
| **LLM Provider** | Google Gemini API (`google-genai` SDK), Model: `gemini-3.5-flash` | State-of-the-art reasoning, high throughput, and strict prompt adherence for factual synthesis. |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | Lightweight, fast 384-dimensional dense embeddings optimized for semantic search across clinical and economic dialogues. |
| **Vector Database** | ChromaDB (`chromadb.PersistentClient`) | Embedded, serverless vector store with metadata filtering and cosine similarity indexing. |

---

## 3. Large Language Model (Gemini)

- **Model**: `gemini-3.5-flash` (configurable via `GEMINI_MODEL` in `.env`)
- **SDK**: Official Google GenAI SDK (`google-genai`)
- **Sampling Temperature**: `0.1` (ensures deterministic, factual responses with minimal variance)
- **Transient Error Retry Handling**:
  - Implements exponential backoff with jitter (approx. 2s, 4s, 8s) up to 4 total attempts.
  - Retries **only** transient network/service errors: `503 UNAVAILABLE`, `500 INTERNAL`, `504 DEADLINE_EXCEEDED`, and temporary `429 RESOURCE_EXHAUSTED` rate limits.
  - Rejects permanent client errors immediately without retrying (`400`, `401`, `403`, `404`).
- **Quota Exhaustion Safeguard**:
  - Differentiates permanent free-tier quota exhaustion (`generate_content_free_tier_requests` / `QuotaFailure`) from transient rate limits.
  - Bypasses retry loops on quota exhaustion and immediately returns a clean HTTP 503 error message: *"The AI service quota is currently exhausted. Please try again later."*

---

## 4. Custom RAG Pipeline

InsightLens AI implements a modular, transparent, and deterministic custom RAG pipeline without heavy orchestration frameworks (e.g., LangChain):

1. **Transcript Parsing**: Raw dialogue turns in `data/transcripts/` are parsed into structured utterance records preserving timestamps (`01:20`), speaker names, expert roles, and source file metadata.
2. **Contextual Semantic Chunking**: Rather than splitting arbitrary character windows, each chunk pairs the interviewer's question context with the expert's substantive response. This allows semantic queries to match both the clinical question and the expert's answer, while preserving the clean quote boundary.
3. **Dense Vector Embeddings**: Embeddings are computed with `all-MiniLM-L6-v2` and L2-normalized into a shared 384-dimensional cosine space.
4. **ChromaDB Indexing**: Chunks are stored with deterministic IDs (`{market}_{timestamp}_{idx}`) ensuring fully idempotent re-ingestion.
5. **Top-K Retrieval**: Queries retrieve the top-$k$ most relevant chunks using cosine similarity (`hnsw:space = cosine`).
6. **Prompt Assembly & Evidence Boundaries**: Retrieved chunks are injected into a tightly constrained system prompt instructing the model to rely solely on the provided evidence.
7. **Post-Retrieval Citation Binding**: Citations are mapped directly from retrieved ChromaDB records, ensuring 100% provenance.

---

## 5. Citation & Timestamp Grounding

A core design requirement is that **the LLM must never generate or hallucinate quotations**:

- **Strict Verbatim Rule**: The `exact_quote` field returned by `/api/v1/chat` and `/api/v1/analysis/{id}` is sourced directly from ChromaDB chunk metadata.
- **Role Partitioning**: Gemini generates the analytical answer/summary; the backend attaches the corresponding citation cards containing:
  - `market` and `country` (e.g. `France`, `Germany`, `United Kingdom`)
  - `expert_name` (e.g. `Dr. Jean Martin`, `Anna Keller`, `Dr. Emily Carter`)
  - `timestamp` (e.g. `01:20`)
  - `exact_quote` (verbatim transcript text)
  - `source` (source transcript file)
- **Interactive Deep Linking**: Clicking **"View in Transcript"** on any citation navigates to `/transcripts/{marketId}?t={timestamp}`, which automatically scrolls the viewport and highlights the exact matching utterance in gold.

---

## 6. Hallucination Mitigation Strategy

To eliminate hallucinations common in medical and procurement intelligence, InsightLens AI applies a four-layer defense:

1. **Pre-Retrieval Relevance Filtering**: The pipeline computes the semantic similarity distance of retrieved chunks. If no chunks meet the minimum relevance threshold (e.g., for out-of-domain queries like cooking or sports), the pipeline terminates early without calling the LLM.
2. **Negative Constraint System Prompt**:
   > *"Answer only using the supplied transcript evidence. Do not introduce outside knowledge or extrapolate beyond the text. If the evidence does not adequately answer the question, explicitly output: 'Insufficient evidence in the provided transcripts.' Do not fabricate quotes or timestamps."*
3. **Negative Fallback Detection**: If the model determines that the retrieved context is insufficient, it returns `"Insufficient evidence in the provided transcripts."` and the backend clears citations, preventing unsubstantiated claims.
4. **Deterministic Quote Binding**: Because `exact_quote` values are retrieved from database records rather than model generation tokens, quotation fabrication is mathematically impossible.

---

## 7. Scaling from 3 Transcripts to 30+

To scale InsightLens AI from 3 transcripts to 30, 300, or 3,000 interviews, the following architectural upgrades would be implemented:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Enterprise Scaling Roadmap                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ Challenge at Scale             │ Production Solution                   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 1. Retrieval Precision Drop    │ Hybrid Search (Dense Vectors + BM25)  │
│ 2. Cross-Market Relevance      │ Cross-Encoder Reranking Layer         │
│ 3. Metadata Filtering          │ Multi-Tenant Vector Partitioning      │
│ 4. Long Context Degradation    │ Hierarchical Map-Reduce Synthesis     │
│ 5. Automated Ingestion         │ Async Pipeline with Audio Diarization │
│ 6. Cost & Rate Limits          │ Semantic Caching & Queue Buffering    │
└────────────────────────────────┴───────────────────────────────────────┘
```

1. **Hybrid Retrieval (Dense + Sparse Search)**:
   - Combine dense embeddings (`all-MiniLM-L6-v2`) with sparse keyword retrieval (BM25) using **Reciprocal Rank Fusion (RRF)**.
   - *Benefit*: Captures nuanced semantic concepts while preserving exact matches for specialized surgical devices (e.g., da Vinci, Hugo, CMR Versius), specific hospital names, or regulatory acronyms (e.g., G-BA, HAS, NICE).
2. **Cross-Encoder Reranking**:
   - Introduce a two-stage retrieval pipeline: retrieve the top 50 candidates via vector search, then pass them through a cross-encoder reranker (e.g., `bge-reranker-large` or Cohere Rerank) to select the top 5 most relevant chunks.
   - *Benefit*: Dramatically reduces noise when scaling across dozens of similar interviews.
3. **Hierarchical Metadata Partitioning**:
   - Partition vector indices using structured metadata: `market`, `clinical_specialty`, `hospital_type` (public vs. private), and `interview_date`.
   - *Benefit*: Enables targeted sub-corpus queries (e.g., *"Compare robotic adoption in German private hospitals vs. French public CHUs"*).
4. **Hierarchical / Map-Reduce Synthesis**:
   - When synthesizing insights across 30+ transcripts, single-prompt context windows can suffer from "lost in the middle" degradation.
   - *Solution*: Run parallel per-market or per-expert extractions (Map phase), followed by an executive cross-market synthesis (Reduce phase).
5. **Automated Ingestion Pipeline**:
   - Build an event-driven ingestion worker (Celery / Redis Queue) supporting raw audio input via automated speech-to-text models (Whisper / Gemini Multimodal) with automated speaker diarization and timestamp alignment.
6. **Semantic Caching & Distributed Vector Storage**:
   - Migrate from local ChromaDB to a cloud-native vector database (Qdrant, Milvus, or pgvector) with read-replicas.
   - Implement a Redis semantic cache for frequent queries to deliver sub-second responses and minimize LLM API expenditure.

---

## 8. Configuration & Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

### Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(Required)* | Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/). |
| `GEMINI_MODEL` | `gemini-3.5-flash` | The Gemini model identifier for synthesis. |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Hugging Face model for generating dense vector embeddings. |
| `CHROMA_PATH` | `./chroma_db` | Filesystem path for the persistent ChromaDB database. |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins for CORS in FastAPI. |

---

## 9. Local Setup & Running

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Package Managers**: `pip` and `npm`

### Step 1: Start the FastAPI Backend

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS / Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your valid GEMINI_API_KEY

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **Note**: ChromaDB will automatically index transcript chunks from `data/transcripts/` on the initial startup.

### Step 2: Trigger Manual Ingestion (Optional)

To refresh or rebuild the ChromaDB vector index at any time:

```bash
curl -X POST http://localhost:8000/api/v1/ingest
```

### Step 3: Start the Next.js Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser to access the InsightLens AI dashboard.

---

## 10. API Endpoints Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint returning `{"status": "healthy"}` |
| `GET` | `/experts` | Returns expert profiles for France, Germany, and the UK |
| `GET` | `/questions` | Returns the 6 standardized interview guide inquiries |
| `GET` | `/analysis/{question_id}` | Returns synthesis, market coverage stats, and supporting quotes |
| `GET` | `/transcripts` | Lists available transcript sessions with metadata |
| `GET` | `/transcripts/{market}` | Returns full time-indexed transcript for a specific market |
| `GET` | `/transcripts/{market}/search` | Searches dialogue turns within a market (`?q=query`) |
| `POST` | `/chat` | RAG query endpoint returning answer and verified citations |
| `POST` | `/ingest` | Idempotently indexes transcript chunks into ChromaDB |

Interactive API Documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 11. Automated Testing

Run the comprehensive backend test suite:

```bash
cd backend
.\venv\Scripts\python -m unittest discover -s tests -p "test_*.py"
```

The test suite validates:
- `/health` service availability
- Transcript loading and UTF-8 encoding across France, Germany, and the UK
- Dialogue parsing and exact timestamp preservation
- ChromaDB vector retrieval accuracy and metadata integrity
- Standardized question analysis synthesis structure
- Insufficient evidence rejection for out-of-domain queries
- Transient error exponential backoff and retry behavior
- Quota exhaustion fast-exit and error code compliance
- Verbatim quote binding on all chat responses

To validate the frontend build:

```bash
cd frontend
npm run build
```