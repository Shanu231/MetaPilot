import logging
from typing import List, Dict, Any, Tuple, Optional
from app.ai.vector.embeddings.service import embedding_service
from app.ai.vector.collections.manager import chroma_manager
from app.ai.vector.store import vector_store

logger = logging.getLogger("metapilot_backend")

class SemanticRetriever:
    async def retrieve_semantic_context(
        self,
        query: str,
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Fetch matching metadata contexts matching query embeddings."""
        query_emb = embedding_service.get_embedding(query)
        results = []

        if chroma_manager.is_available:
            try:
                # Query across datasets and schemas collections
                for col_name in ["datasets", "schemas"]:
                    collection = chroma_manager.get_collection(col_name)
                    if not collection:
                        continue
                    
                    # Setup filters compatible with Chroma
                    where_filter = {}
                    if filters:
                        for k, v in filters.items():
                            if v:
                                where_filter[k] = v

                    raw = collection.query(
                        query_embeddings=[query_emb],
                        n_results=limit,
                        where=where_filter if where_filter else None
                    )
                    
                    if raw and raw.get("documents"):
                        docs = raw["documents"][0]
                        metadatas = raw["metadatas"][0]
                        ids = raw["ids"][0]
                        # Distance ranges: Chroma outputs L2 distance. Convert to similarity score
                        distances = raw.get("distances", [[0.0] * len(docs)])[0]
                        
                        for i in range(len(docs)):
                            sim_score = 1.0 / (1.0 + distances[i])
                            results.append({
                                "urn": ids[i].split("_")[0],
                                "content": docs[i],
                                "score": sim_score,
                                "metadata": metadatas[i]
                            })
            except Exception as e:
                logger.warning(f"ChromaDB retrieval query failed: {e}. Falling back to SQLite.")
                results = []

        # Fallback to SQLite Vector Store
        if not results:
            sqlite_matches = vector_store.search(query_emb, limit=limit)
            for urn, content, score in sqlite_matches:
                # Filter client side for simple keys
                if filters:
                    # Basic platform/entity checks on URN string representation
                    platform_filter = filters.get("platform")
                    if platform_filter and platform_filter.lower() not in urn.lower():
                        continue
                results.append({
                    "urn": urn,
                    "content": content,
                    "score": score,
                    "metadata": {"urn": urn}
                })

        # Apply exact keyword ranking boost
        q_words = [w.lower() for w in query.split() if len(w) > 3]
        for item in results:
            boost = 0.0
            content_lower = item["content"].lower()
            for word in q_words:
                if word in content_lower:
                    boost += 0.08  # Boost ranking by 8% for exact word hits
            item["score"] = min(1.0, item["score"] + boost)

        # Sort matches descending by ranking score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

# Global single instance coordinator
semantic_retriever = SemanticRetriever()
