# InsightLens AI

> **AI-Powered Expert Interview Intelligence Platform**  
> *"Turn expert interviews into evidence-backed insights."*

InsightLens AI is an enterprise-grade intelligence platform analyzing expert interview transcripts across France, Germany, and the United Kingdom regarding the European robotic surgery market. The system enables researchers, clinicians, and hospital leadership to explore verbatim dialogues, compare cross-market themes, examine procurement divergences, and ask research questions through an evidence-grounded custom RAG pipeline.

---

## 1. System Architecture

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
                  (google-genai SDK, strict grounding)
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

---

## 2. Custom RAG Pipeline

InsightLens AI implements a simple, transparent, and deterministic custom RAG pipeline without complex abstraction layers (no LangChain):

1. **Transcript Parsing**: Raw dialogue turns in `data/transcripts/` are parsed into structured utterance records preserving exact timestamps (`00:00`, `00:18`, `01:20`, etc.), speaker tags, roles, and source file metadata.
2. **Contextual Semantic Chunking**: Each chunk pairs the interviewer's inquiry with the expert's substantive response. This allows semantic queries to match both the question topic and the expert's response while ensuring the retrieved document text is strictly the expert's answer.
3. **Dense Vector Embeddings**: Embeddings are generated using SentenceTransformers to map clinical and procurement inquiries into a shared 384-dimensional cosine space.
4. **ChromaDB Storage**: A persistent ChromaDB vector store indexes the chunks using deterministic IDs (`{market}_{timestamp}_{id}`) for completely idempotent re-ingestion.
5. **Top-K Semantic Retrieval**: Retrieves the most relevant transcript segments with associated metadata.
6. **Gemini Grounded Synthesis**: Retrieved chunks are assembled into a structured prompt for Google Gemini, enforcing strict evidence boundaries.
7. **Verbatim Quote Citation Guarantee**: The backend extracts citations directly from the retrieved source chunks stored in ChromaDB. The LLM synthesizes the summary, but never generates or paraphrases the `exact_quote` value.

---

## 3. Embedding Model

- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensionality**: 384 dimensions
- **Distance Metric**: Cosine distance (`hnsw:space = cosine`)
- **Characteristics**: Fast, lightweight, highly accurate for sentence-level semantic matching across clinical and economic terminology.
- **Normalization**: Embeddings are L2-normalized upon creation.

---

## 4. Vector Database (ChromaDB)

- **Engine**: ChromaDB (`chromadb.PersistentClient`)
- **Path**: `./backend/chroma_db`
- **Collection Name**: `insightlens_transcripts`
- **Metadata Preserved per Chunk**:
  - `market`: Target healthcare market (`France`, `Germany`, `United Kingdom`)
  - `market_id`: Identifier (`france`, `germany`, `uk`)
  - `expert_name`: Name of the interview subject
  - `expert_role`: Clinical or executive role
  - `speaker`: Active speaker tag
  - `timestamp`: Verbatim source timestamp (e.g. `01:20`)
  - `source`: Source filename (e.g. `Transcript_1_France.txt`)
  - `is_interviewer`: Boolean indicator

---

## 5. Large Language Model (Gemini)

- **Provider**: Google Gemini API via the official `google-genai` Python SDK
- **Model**: `gemini-2.5-flash` (configurable via `GEMINI_MODEL`)
- **Temperature**: `0.1` (low temperature for deterministic, factual adherence)
- **Role**: Synthesize findings across retrieved evidence chunks without introducing external knowledge or fabricating quotations.

---

## 6. Evidence & Timestamp Handling

A core tenet of InsightLens AI is that **every insight must be traceable to primary evidence**:

- **Strict Verbatim Rule**: `exact_quote` values returned in API citations are extracted directly from the verified utterance text in ChromaDB.
- **Zero Hallucinated Quotes**: Gemini is never asked to generate or paraphrase quotations.
- **Deep Linking**: The frontend uses timestamps (e.g., `?t=01:20`) to auto-scroll and highlight the corresponding dialogue turn in the interactive Transcript Viewer.

---

## 7. Hallucination Mitigation

The platform employs multi-layered defenses against hallucinations:

1. **Pre-Retrieval Relevance Gate**: If the best similarity score among retrieved chunks is below threshold (e.g., off-topic queries like recipes or sports), the pipeline terminates early.
2. **Strict System Instruction**:
   > *"Answer only using the supplied transcript evidence. Do not introduce facts that are not present in the evidence. If the evidence is insufficient, explicitly state 'Insufficient evidence in the provided transcripts.' Do not fabricate quotes or timestamps."*
3. **Negative Fallback Detection**: If the model determines that the provided evidence is inadequate, it outputs `Insufficient evidence in the provided transcripts.`, returning an empty sources list.
4. **Citation Validation**: Citations are only attached if the corresponding source chunk was actually retrieved and relevant to the query.

---

## 8. API Endpoints Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint returning `{"status": "healthy"}` |
| `GET` | `/experts` | Returns list of expert profiles (France, Germany, UK) |
| `GET` | `/questions` | Returns the 6 standardized interview guide inquiries |
| `GET` | `/analysis/{question_id}` | Returns AI synthesis, coverage stats, and supporting evidence |
| `GET` | `/transcripts` | Lists all transcript sessions (optional `?market=` filter) |
| `GET` | `/transcripts/{market}` | Retrieves the complete time-indexed transcript for a market |
| `GET` | `/transcripts/{market}/search` | Searches dialogue turns within a market by query (`?q=`) |
| `POST` | `/chat` | RAG query endpoint returning answer and verified citations |
| `POST` | `/ingest` | Idempotently ingests/refreshes transcript chunks into ChromaDB |

Interactive OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 9. Configuration & Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHROMA_PATH=./chroma_db
CORS_ORIGINS=http://localhost:3000
```

---

## 10. Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Set Up and Start the FastAPI Backend
```bash
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will automatically initialize ChromaDB and index the transcript chunks on startup.

### 2. Run Ingestion Manually (Optional)
```bash
curl -X POST http://localhost:8000/api/v1/ingest
```

### 3. Start the Next.js Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 11. Automated Testing

Run the backend test suite:
```bash
cd backend
python -m unittest discover -s tests -p "test_*.py"
```

The suite covers:
- `/health` endpoint response
- Transcript loading across France, Germany, and the UK
- Transcript metadata and exact timestamp preservation
- ChromaDB vector retrieval accuracy
- Question analysis endpoint structure
- Insufficient evidence rejection behavior
- Grounded chat response citation formatting