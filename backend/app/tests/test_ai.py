import pytest
from app.ai.providers.gemini import GeminiProvider
from app.ai.memory.session import memory_manager
from app.ai.vector.store import vector_store
from app.ai.prompts.templates import PROMPT_TEMPLATES

def test_prompts_templates_loaded():
    assert "system" in PROMPT_TEMPLATES
    assert "reasoning" in PROMPT_TEMPLATES
    assert "sql" in PROMPT_TEMPLATES

def test_memory_manager_flows():
    sess_id = "test-sess-uuid"
    memory_manager.get_or_create_session(sess_id)
    memory_manager.add_message(sess_id, "user", "What is stripe_webhook_events?")
    memory_manager.add_message(sess_id, "assistant", "Stripe webhook events staging table.")

    messages = memory_manager.list_messages(sess_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"

    # Test pinning
    memory_manager.set_pin(sess_id, True)
    sessions = memory_manager.list_sessions()
    target_session = next(s for s in sessions if s["id"] == sess_id)
    assert target_session["pinned"] is True

    # Test deletion
    memory_manager.delete_session(sess_id)
    assert len([s for s in memory_manager.list_sessions() if s["id"] == sess_id]) == 0

def test_vector_store_cosine_similarity():
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]

    assert vector_store._cosine_similarity(v1, v2) == 1.0
    assert vector_store._cosine_similarity(v1, v3) == 0.0

@pytest.mark.asyncio
async def test_gemini_stream_simulator():
    provider = GeminiProvider()
    chunks = []
    async for chunk in provider.generate_stream("Who owns users_dim?"):
        chunks.append(chunk)

    full_text = "".join(chunks)
    assert "Marcus Vance" in full_text
    assert "users_dim" in full_text
