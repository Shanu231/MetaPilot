import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("metapilot_backend")

# In-memory global registry mapping session_id to message lists
SESSION_REGISTRY: Dict[str, Dict[str, Any]] = {}

class ConversationMemoryManager:
    def get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in SESSION_REGISTRY:
            SESSION_REGISTRY[session_id] = {
                "id": session_id,
                "messages": [],
                "pinned": False,
                "summary": "General Workspace Query Session"
            }
            logger.info(f"Memory: Initialized conversation session {session_id}")
        return SESSION_REGISTRY[session_id]

    def add_message(self, session_id: str, role: str, content: str):
        session = self.get_or_create_session(session_id)
        session["messages"].append({
            "role": role,
            "content": content
        })

    def list_messages(self, session_id: str) -> List[Dict[str, str]]:
        session = self.get_or_create_session(session_id)
        return session["messages"]

    def set_pin(self, session_id: str, pinned: bool):
        session = self.get_or_create_session(session_id)
        session["pinned"] = pinned

    def list_sessions(self) -> List[Dict[str, Any]]:
        return list(SESSION_REGISTRY.values())

    def delete_session(self, session_id: str):
        if session_id in SESSION_REGISTRY:
            del SESSION_REGISTRY[session_id]

# Single global coordinator instance
memory_manager = ConversationMemoryManager()
