import uuid
import json
import logging
from typing import Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.dependencies.auth_dep import get_current_user
from app.ai.agents.orchestrator import agent_orchestrator
from app.ai.memory.session import memory_manager

router = APIRouter()
logger = logging.getLogger("metapilot_backend")

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class PinRequest(BaseModel):
    session_id: str
    pinned: bool

@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest,
    current_user: Any = Depends(get_current_user)
):
    session_id = body.session_id or f"sess-{uuid.uuid4()}"
    query = body.query

    async def event_generator():
        yield f"data: __SESSION_ID__:{session_id}\n\n"
        
        full_response = []
        try:
            async for chunk in agent_orchestrator.execute_agent_chain(query):
                if not chunk.startswith("__META__:"):
                    full_response.append(chunk)
                yield f"data: {chunk}\n\n"
            
            # Save final concatenated response to conversation memory logs
            assistant_text = "".join(full_response)
            memory_manager.add_message(session_id, "user", query)
            memory_manager.add_message(session_id, "assistant", assistant_text)
            
        except Exception as e:
            logger.error(f"Error in chat streaming generator loop: {e}")
            yield f"data: [ERROR]: Chat processing failed due to connection error.\n\n"
        
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/chat/history")
async def chat_history(current_user: Any = Depends(get_current_user)):
    # Initialize basic conversations if registry is empty
    sessions = memory_manager.list_sessions()
    if len(sessions) == 0:
        sess_id = "sess-default-lineage"
        memory_manager.get_or_create_session(sess_id)
        memory_manager.add_message(sess_id, "user", "Explain customer pipeline.")
        memory_manager.add_message(sess_id, "assistant", "Based on DataHub mappings, the customer ingest pipeline Stages raw Snowflake data flows into Stage analytics tables.")
        sessions = memory_manager.list_sessions()
        
    return sessions

@router.post("/chat/pins")
async def chat_pin(body: PinRequest, current_user: Any = Depends(get_current_user)):
    memory_manager.set_pin(body.session_id, body.pinned)
    return {"detail": f"Session pin state updated: {body.pinned}"}

@router.delete("/chat/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: Any = Depends(get_current_user)
):
    memory_manager.delete_session(session_id)
    return {"detail": "Conversation session removed successfully."}
