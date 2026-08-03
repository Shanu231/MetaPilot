import logging
from datetime import datetime, UTC
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models import ChatSession, ChatMessage

logger = logging.getLogger("metapilot_backend")

class ConversationMemoryManager:
    async def get_or_create_session(
        self, 
        db: AsyncSession, 
        session_id: str, 
        user_id: str, 
        title: Optional[str] = None
    ) -> ChatSession:
        """Fetch or create a persistent chat session."""
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalars().first()
        if not session:
            # Use truncated query or placeholder for default session title
            session_title = title or f"Session #{session_id[:8]}"
            session = ChatSession(
                id=session_id,
                user_id=user_id,
                title=session_title,
                pinned=False,
                summary="General Workspace Query Session"
            )
            db.add(session)
            await db.commit()
            logger.info(f"Database Memory: Initialized conversation session {session_id} for user {user_id}")
        return session

    async def add_message(self, db: AsyncSession, session_id: str, sender: str, content: str, user_id: str):
        """Append a new message directly to the database chat history."""
        # Ensure session exists
        await self.get_or_create_session(db, session_id, user_id)
        
        new_msg = ChatMessage(
            session_id=session_id,
            sender=sender,
            content=content
        )
        db.add(new_msg)
        await db.commit()
        logger.info(f"Database Memory: Added message from {sender} to session {session_id}")

    async def list_messages(self, db: AsyncSession, session_id: str) -> List[Dict[str, Any]]:
        """List messages sorted chronologically."""
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.timestamp.asc())
        )
        messages = result.scalars().all()
        return [
            {
                "id": m.id,
                "sender": m.sender,
                "content": m.content,
                "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.now(UTC).isoformat()
            }
            for m in messages
        ]

    async def set_pin(self, db: AsyncSession, session_id: str, pinned: bool):
        """Update session pinned state."""
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalars().first()
        if session:
            session.pinned = pinned
            await db.commit()
            logger.info(f"Database Memory: Updated session {session_id} pin status to {pinned}")

    async def list_sessions(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """List active sessions for a specific user, sorted by pinned and created timestamp."""
        result = await db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.pinned.desc(), ChatSession.created_at.desc())
        )
        sessions = result.scalars().all()
        
        output = []
        for s in sessions:
            msg_res = await db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == s.id)
                .order_by(ChatMessage.timestamp.asc())
            )
            msgs = msg_res.scalars().all()
            
            output.append({
                "id": s.id,
                "title": s.title,
                "pinned": s.pinned,
                "summary": s.summary,
                "messages": [
                    {
                        "id": m.id,
                        "sender": m.sender,
                        "content": m.content,
                        "timestamp": m.timestamp.strftime("%H:%M") if m.timestamp else datetime.now(UTC).strftime("%H:%M")
                    }
                    for m in msgs
                ]
            })
        return output

    async def delete_session(self, db: AsyncSession, session_id: str):
        """Delete session and cascades delete to related messages."""
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalars().first()
        if session:
            await db.delete(session)
            await db.commit()
            logger.info(f"Database Memory: Deleted session {session_id}")

# Global single instance coordinator
memory_manager = ConversationMemoryManager()
