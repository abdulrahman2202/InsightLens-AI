import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.transcript_service import transcript_service
from app.services.vector_service import vector_service
from app.services.rag_service import rag_service


class TestBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Ensure transcripts are ingested
        vector_service.ingest_transcripts()

    def test_health_endpoint(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})

    def test_transcript_loading(self):
        transcripts = transcript_service.get_all_transcripts()
        self.assertEqual(len(transcripts), 3)

        markets = {t.market for t in transcripts}
        self.assertIn("france", markets)
        self.assertIn("germany", markets)
        self.assertIn("uk", markets)

    def test_transcript_metadata(self):
        france_session = transcript_service.get_transcript_by_market("france")
        self.assertIsNotNone(france_session)
        self.assertEqual(france_session.expert_name, "Dr. Jean Martin")
        self.assertEqual(france_session.expert_role, "Head of Urology")
        self.assertEqual(france_session.duration, "06:08")

        # Verify first expert response in France has correct timestamp and exact quote
        expert_utterances = [u for u in france_session.utterances if not u.is_interviewer]
        self.assertTrue(len(expert_utterances) > 0)
        first_quote = expert_utterances[0]
        self.assertEqual(first_quote.timestamp, "00:18")
        self.assertIn("Adoption is growing", first_quote.text)

    def test_retrieval(self):
        # Query about capital budget
        chunks = vector_service.retrieve_relevant_chunks("capital budget approval", top_k=3)
        self.assertTrue(len(chunks) > 0)

        # Verify metadata integrity
        top_chunk = chunks[0]
        self.assertIn("text", top_chunk)
        self.assertIn("metadata", top_chunk)
        self.assertIn("timestamp", top_chunk["metadata"])
        self.assertIn("expert_name", top_chunk["metadata"])
        self.assertIn("source", top_chunk["metadata"])

    def test_analysis_endpoint(self):
        response = self.client.get("/api/v1/analysis/1")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["question_id"], 1)
        self.assertIn("ai_summary", data)
        self.assertEqual(len(data["evidence_list"]), 3)
        
        # Verify timestamps and quotes
        for item in data["evidence_list"]:
            self.assertIn("timestamp", item)
            self.assertIn("exact_quote", item)
            self.assertIn("expert_name", item)

    def test_insufficient_evidence_behavior(self):
        # Unrelated query should yield insufficient evidence
        response = rag_service.answer_question("What is the recipe for baking a chocolate cake?")
        self.assertEqual(response.answer, "Insufficient evidence in the provided transcripts.")
        self.assertEqual(len(response.sources), 0)

    @patch("app.services.rag_service.rag_service.get_client")
    def test_chat_response_structure_with_mocked_gemini(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            "In European markets, robotic surgery adoption is concentrated in large academic centers [Evidence 1]."
        )
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("answer", data)
        self.assertIn("sources", data)
        self.assertTrue(len(data["sources"]) > 0)
        
        # Check source citation fields
        citation = data["sources"][0]
        self.assertIn("market", citation)
        self.assertIn("expert_name", citation)
        self.assertIn("timestamp", citation)
        self.assertIn("quote", citation)
        self.assertIn("source", citation)


if __name__ == "__main__":
    unittest.main()
