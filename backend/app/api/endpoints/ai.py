import uuid
import json
import logging
from typing import Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db, AsyncSessionLocal
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
            
            # Save final concatenated response to conversation memory logs using a dedicated session
            assistant_text = "".join(full_response)
            async with AsyncSessionLocal() as db_session:
                # Use query as the default title for the session if it's new
                title = query[:40] + "..." if len(query) > 40 else query
                await memory_manager.get_or_create_session(db_session, session_id, current_user.id, title)
                await memory_manager.add_message(db_session, session_id, "user", query, current_user.id)
                await memory_manager.add_message(db_session, session_id, "assistant", assistant_text, current_user.id)
            
        except Exception as e:
            logger.error(f"Error in chat streaming generator loop: {e}")
            yield f"data: [ERROR]: Chat processing failed due to connection error.\n\n"
        
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/chat/history")
async def chat_history(
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sessions = await memory_manager.list_sessions(db, current_user.id)
    if len(sessions) == 0:
        # Seed default help chat
        sess_id = f"sess-default-{uuid.uuid4()}"
        await memory_manager.get_or_create_session(db, sess_id, current_user.id, "Explain customer pipeline")
        await memory_manager.add_message(db, sess_id, "user", "Explain customer pipeline.", current_user.id)
        await memory_manager.add_message(
            db, 
            sess_id, 
            "assistant", 
            "Based on DataHub mappings, the customer ingest pipeline stages raw Snowflake data flows into Stage analytics tables.", 
            current_user.id
        )
        sessions = await memory_manager.list_sessions(db, current_user.id)
        
    return sessions

@router.post("/chat/pins")
async def chat_pin(
    body: PinRequest, 
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await memory_manager.set_pin(db, body.session_id, body.pinned)
    return {"detail": f"Session pin state updated: {body.pinned}"}

@router.delete("/chat/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await memory_manager.delete_session(db, session_id)
    return {"detail": "Conversation session removed successfully."}

