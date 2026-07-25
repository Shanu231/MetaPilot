import logging
from typing import Any, Dict, List, Optional
from app.core.config import settings

logger = logging.getLogger("metapilot_backend")

class ChromaDBManager:
    def __init__(self):
        self.client = None
        self.is_available = False
        self.collections: Dict[str, Any] = {}
        
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings
            
            logger.info(f"ChromaDB: Initializing persistent client at path: {settings.CHROMADB_PERSIST_PATH}")
            self.client = chromadb.PersistentClient(path=settings.CHROMADB_PERSIST_PATH)
            self.is_available = True
            
            # Setup active collections
            collection_names = [
                "datasets", "schemas", "pipelines", 
                "dashboards", "owners", "tags", 
                "glossary", "lineage_context"
            ]
            for name in collection_names:
                self.collections[name] = self.client.get_or_create_collection(name=name)
            logger.info("ChromaDB: All collections initialized successfully.")
            
        except ImportError:
            logger.warning("ChromaDB package is not installed. Routing vector collections to SQLite fallback storage.")
            self.is_available = False
        except Exception as e:
            logger.warning(f"ChromaDB persistence initialization failed: {e}. Routing to SQLite fallback.")
            self.is_available = False

    def get_collection(self, name: str) -> Optional[Any]:
        if not self.is_available:
            return None
        return self.collections.get(name)

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_available": self.is_available,
            "provider": "ChromaDB" if self.is_available else "SQLite Fallback",
            "persist_path": settings.CHROMADB_PERSIST_PATH,
            "active_collections": list(self.collections.keys()) if self.is_available else []
        }

# Global single instance coordinator
chroma_manager = ChromaDBManager()
