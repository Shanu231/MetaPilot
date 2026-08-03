import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.gemini import GeminiProvider
from app.ai.memory.session import memory_manager
from app.ai.vector.store import vector_store
from app.ai.prompts.templates import PROMPT_TEMPLATES
from app.models.models import ChatSession, ChatMessage

def test_prompts_templates_loaded():
    assert "system" in PROMPT_TEMPLATES
    assert "reasoning" in PROMPT_TEMPLATES
    assert "sql" in PROMPT_TEMPLATES

@pytest.mark.asyncio
async def test_memory_manager_flows():
    db = AsyncMock(spec=AsyncSession)
    user_id = "test-user-id"
    sess_id = "test-sess-uuid"
    
    # 1. Mock session lookup
    mock_session = ChatSession(id=sess_id, user_id=user_id, title="Test Session", pinned=False, summary="General Workspace Query Session")
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_session
    db.execute.return_value = mock_result
    
    session = await memory_manager.get_or_create_session(db, sess_id, user_id)
    assert session.id == sess_id
    assert session.user_id == user_id
    
    # 2. Mock add message
    await memory_manager.add_message(db, sess_id, "user", "What is stripe_webhook_events?", user_id)
    db.add.assert_called()
    assert db.commit.call_count >= 1

    # 3. Mock list messages
    mock_msg1 = ChatMessage(id="msg-1", session_id=sess_id, sender="user", content="Hello")
    mock_msg2 = ChatMessage(id="msg-2", session_id=sess_id, sender="assistant", content="Hi")
    mock_msg_result = MagicMock()
    mock_msg_result.scalars.return_value.all.return_value = [mock_msg1, mock_msg2]
    db.execute.return_value = mock_msg_result
    
    messages = await memory_manager.list_messages(db, sess_id)
    assert len(messages) == 2
    assert messages[0]["sender"] == "user"
    assert messages[1]["sender"] == "assistant"

    # 4. Mock pinning
    db.execute.return_value = mock_result
    await memory_manager.set_pin(db, sess_id, True)
    assert mock_session.pinned is True

    # 5. Mock list sessions
    mock_session_result = MagicMock()
    mock_session_result.scalars.return_value.all.return_value = [mock_session]
    db.execute.side_effect = [mock_session_result, mock_msg_result]
    
    sessions = await memory_manager.list_sessions(db, user_id)
    assert len(sessions) == 1
    assert sessions[0]["id"] == sess_id
    
    # Reset side effect
    db.execute.side_effect = None

    # 6. Mock deletion
    db.execute.return_value = mock_result
    await memory_manager.delete_session(db, sess_id)
    db.delete.assert_called_with(mock_session)

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

