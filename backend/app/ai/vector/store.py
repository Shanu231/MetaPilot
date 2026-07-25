import os
import json
import sqlite3
import logging
from typing import List, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger("metapilot_backend")

class SQLiteVectorStore:
    def __init__(self, db_path: str = "vector_store.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS metadata_chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                urn TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_urn ON metadata_chunks(urn)")
        conn.commit()
        conn.close()

    def add_chunk(self, urn: str, content: str, embedding: List[float]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        # Serialize embedding float list to JSON string
        emb_json = json.dumps(embedding)
        cursor.execute(
            "INSERT INTO metadata_chunks (urn, content, embedding) VALUES (?, ?, ?)",
            (urn, content, emb_json)
        )
        conn.commit()
        conn.close()

    def list_chunks(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT urn, content FROM metadata_chunks")
        rows = cursor.fetchall()
        conn.close()
        return [{"urn": r[0], "content": r[1]} for r in rows]

    def search(self, query_embedding: List[float], limit: int = 5) -> List[Tuple[str, str, float]]:
        """Compute cosine similarity between query embedding and all stored chunks, sorting by score."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT urn, content, embedding FROM metadata_chunks")
        rows = cursor.fetchall()
        conn.close()

        results = []
        for urn, content, emb_json in rows:
            try:
                emb = json.loads(emb_json)
                score = self._cosine_similarity(query_embedding, emb)
                results.append((urn, content, score))
            except Exception as e:
                logger.warning(f"Failed to calculate similarity scores for URN {urn}: {e}")

        # Sort descending by score
        results.sort(key=lambda x: x[2], reverse=True)
        return results[:limit]

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm_a = sum(a * a for a in v1) ** 0.5
        norm_b = sum(b * b for b in v2) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)

    def clear(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM metadata_chunks")
        conn.commit()
        conn.close()

# Global single instance coordinator
vector_store = SQLiteVectorStore()
