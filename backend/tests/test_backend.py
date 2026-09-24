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

    def test_is_transient_error_classification(self):
        from app.services.rag_service import is_transient_error, is_quota_exhausted_error
        from google.genai.errors import ServerError, ClientError

        # Transient errors (must return True)
        self.assertTrue(is_transient_error(ServerError(503, {"error": {"code": 503, "status": "UNAVAILABLE"}})))
        self.assertTrue(is_transient_error(ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "Rate limit exceeded. Try again in 1s."}})))
        self.assertTrue(is_transient_error(ServerError(500, {"error": {"code": 500, "status": "INTERNAL"}})))
        self.assertTrue(is_transient_error(ServerError(504, {"error": {"code": 504, "status": "DEADLINE_EXCEEDED"}})))

        # Quota-exhaustion 429 errors (must return False from is_transient_error, True from is_quota_exhausted_error)
        quota_err1 = ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests limit: 20"}})
        self.assertTrue(is_quota_exhausted_error(quota_err1))
        self.assertFalse(is_transient_error(quota_err1))

        quota_err2 = ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "You exceeded your current quota, please check your plan and billing details."}})
        self.assertTrue(is_quota_exhausted_error(quota_err2))
        self.assertFalse(is_transient_error(quota_err2))

        quota_err3 = ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "QuotaFailure: free tier quota limit reached."}})
        self.assertTrue(is_quota_exhausted_error(quota_err3))
        self.assertFalse(is_transient_error(quota_err3))

        # Non-retryable errors (must return False)
        self.assertFalse(is_transient_error(ClientError(400, {"error": {"code": 400, "status": "INVALID_ARGUMENT"}})))
        self.assertFalse(is_transient_error(ClientError(401, {"error": {"code": 401, "status": "UNAUTHENTICATED"}})))
        self.assertFalse(is_transient_error(ClientError(403, {"error": {"code": 403, "status": "PERMISSION_DENIED"}})))
        self.assertFalse(is_transient_error(ClientError(404, {"error": {"code": 404, "status": "NOT_FOUND"}})))
        self.assertFalse(is_transient_error(Exception("API_KEY_INVALID: Your API key is not valid.")))

    @patch("time.sleep")
    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_quota_exhausted_does_not_retry(self, mock_get_client, mock_sleep):
        from google.genai.errors import ClientError

        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = ClientError(
            429,
            {"error": {
                "code": 429,
                "message": "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests limit: 20",
                "status": "RESOURCE_EXHAUSTED"
            }}
        )
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        # Verifies ONLY 1 attempt was made (no retries!)
        self.assertEqual(mock_client.models.generate_content.call_count, 1)
        self.assertEqual(mock_sleep.call_count, 0)
        # Verifies clean HTTP 503 response and specific quota exhausted message
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "The AI service quota is currently exhausted. Please try again later."
        )

    @patch("time.sleep")
    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_transient_429_retries(self, mock_get_client, mock_sleep):
        from google.genai.errors import ClientError

        mock_client = MagicMock()
        mock_success = MagicMock()
        mock_success.text = "Robotic surgery adoption is growing [Evidence 1]."

        # Fail with transient 429 rate limit once, then succeed
        mock_client.models.generate_content.side_effect = [
            ClientError(429, {"error": {"code": 429, "message": "Rate limit exceeded. Please wait a moment.", "status": "RESOURCE_EXHAUSTED"}}),
            mock_success,
        ]
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        self.assertEqual(mock_client.models.generate_content.call_count, 2)
        self.assertEqual(mock_sleep.call_count, 1)
        self.assertEqual(response.status_code, 200)
        self.assertIn("adoption is growing", response.json()["answer"].lower())

    @patch("time.sleep")
    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_retry_transient_exhaustion(self, mock_get_client, mock_sleep):
        from google.genai.errors import ServerError

        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = ServerError(
            503, {"error": {"code": 503, "message": "High demand", "status": "UNAVAILABLE"}}
        )
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        # Verifies 4 attempts total (1 initial + 3 retries)
        self.assertEqual(mock_client.models.generate_content.call_count, 4)
        # Verifies sleep was called 3 times for exponential backoff
        self.assertEqual(mock_sleep.call_count, 3)
        # Verifies clean 503 response and user-facing message
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "The AI service is temporarily unavailable. Please try again in a moment."
        )

    @patch("time.sleep")
    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_retry_transient_then_succeeds(self, mock_get_client, mock_sleep):
        from google.genai.errors import ServerError

        mock_client = MagicMock()
        mock_success = MagicMock()
        mock_success.text = "Robotic surgery adoption is growing [Evidence 1]."

        # Fail twice with 503, succeed on attempt 3
        mock_client.models.generate_content.side_effect = [
            ServerError(503, {"error": {"code": 503, "message": "Spike in demand", "status": "UNAVAILABLE"}}),
            ServerError(503, {"error": {"code": 503, "message": "Spike in demand", "status": "UNAVAILABLE"}}),
            mock_success,
        ]
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        self.assertEqual(mock_client.models.generate_content.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)
        self.assertEqual(response.status_code, 200)
        self.assertIn("adoption is growing", response.json()["answer"].lower())

    @patch("time.sleep")
    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_non_retryable_error_does_not_retry(self, mock_get_client, mock_sleep):
        from google.genai.errors import ClientError

        mock_client = MagicMock()
        # 401 UNAUTHENTICATED
        mock_client.models.generate_content.side_effect = ClientError(
            401, {"error": {"code": 401, "message": "Invalid key", "status": "UNAUTHENTICATED"}}
        )
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        # Verifies ONLY 1 attempt was made (no retries!)
        self.assertEqual(mock_client.models.generate_content.call_count, 1)
        self.assertEqual(mock_sleep.call_count, 0)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "The AI service is temporarily unavailable. Please try again in a moment."
        )

    @patch("app.services.rag_service.rag_service.get_client")
    def test_gemini_afc_disabled_in_config(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Answer text [Evidence 1]."
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        response = self.client.post("/api/v1/chat", json={"question": "How is adoption distributed?"})
        self.assertEqual(response.status_code, 200)
        
        # Verify GenerateContentConfig passed to generate_content has automatic_function_calling.disable == True
        call_kwargs = mock_client.models.generate_content.call_args.kwargs
        config = call_kwargs.get("config")
        self.assertIsNotNone(config)
        self.assertIsNotNone(config.automatic_function_calling)
        self.assertTrue(config.automatic_function_calling.disable)


if __name__ == "__main__":
    unittest.main()

