import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings
from app.services.embedding_service import embedding_service
from app.services.transcript_service import transcript_service


class VectorService:
    def __init__(self):
        self.chroma_path = settings.CHROMA_PATH
        self.collection_name = settings.CHROMA_COLLECTION
        self._client = None
        self._collection = None

    @property
    def client(self) -> chromadb.PersistentClient:
        if self._client is None:
            os.makedirs(self.chroma_path, exist_ok=True)
            self._client = chromadb.PersistentClient(path=self.chroma_path)
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    def get_count(self) -> int:
        return self.collection.count()

    def ingest_transcripts(self, force: bool = False) -> int:
        """
        Idempotent ingestion of all transcript chunks into ChromaDB.
        Avoids creating duplicate records.
        """
        chunks = transcript_service.get_chunks_for_ingestion()
        if not chunks:
            return 0

        if force:
            try:
                self.client.delete_collection(self.collection_name)
            except Exception:
                pass
            self._collection = None
        elif self.get_count() > 0:
            # Already ingested and not forcing re-ingestion
            return self.get_count()

        ids = [chunk["id"] for chunk in chunks]
        texts = [chunk["text"] for chunk in chunks]
        contextual_texts = [chunk["contextual_text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        # Compute embeddings on contextual text for richer semantic representation
        embeddings = embedding_service.embed_texts(contextual_texts)

        # Upsert ensures idempotency
        self.collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )

        return self.collection.count()

    def retrieve_relevant_chunks(
        self,
        query: str,
        top_k: int = 5,
        market_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k chunks matching query semantic vector.
        Metadata filtering is supported by market_id if specified.
        """
        # Ensure collection has records
        if self.get_count() == 0:
            self.ingest_transcripts()

        query_embedding = embedding_service.embed_query(query)

        where_clause = None
        if market_filter and market_filter.lower() != "all":
            where_clause = {"market_id": market_filter.lower()}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_clause,
            include=["documents", "metadatas", "distances"]
        )

        formatted_chunks: List[Dict[str, Any]] = []

        if not results or not results["ids"] or len(results["ids"][0]) == 0:
            return formatted_chunks

        ids = results["ids"][0]
        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        for chunk_id, doc, meta, dist in zip(ids, documents, metadatas, distances):
            formatted_chunks.append({
                "id": chunk_id,
                "text": doc,  # EXACT transcript quote text!
                "metadata": meta,
                "distance": float(dist),
                "similarity": 1.0 - float(dist),  # cosine similarity
            })

        return formatted_chunks


vector_service = VectorService()
