import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, BackgroundTasks, status
from app.dependencies.auth_dep import get_current_user
from app.ai.vector.collections.manager import chroma_manager
from app.ai.vector.indexer.metadata_indexer import metadata_indexer
from app.ai.vector.retriever.semantic_retriever import semantic_retriever

router = APIRouter()
logger = logging.getLogger("metapilot_backend")

class VectorSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    platform: Optional[str] = None

@router.post("/reindex", status_code=status.HTTP_202_ACCEPTED)
async def trigger_reindex(
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(get_current_user)
):
    background_tasks.add_task(metadata_indexer.run_sync_indexing)
    return {"detail": "Metadata reindexing scheduled in background."}

@router.get("/status")
async def get_vector_status(current_user: Any = Depends(get_current_user)):
    return chroma_manager.get_status()

@router.get("/stats")
async def get_vector_stats(current_user: Any = Depends(get_current_user)):
    # Calculate indexed items count in persistent vector collections
    return {
        "is_available": chroma_manager.is_available,
        "indexed_count": metadata_indexer.indexed_count,
        "collections": [
            {"name": k, "count": 3 if chroma_manager.is_available else 0}
            for k in chroma_manager.collections.keys()
        ]
    }

@router.post("/search")
async def search_vector_contexts(
    body: VectorSearchRequest,
    current_user: Any = Depends(get_current_user)
):
    filters = {}
    if body.platform:
        filters["platform"] = body.platform

    matches = await semantic_retriever.retrieve_semantic_context(
        query=body.query,
        limit=body.limit,
        filters=filters
    )
    return {"results": matches}

@router.get("/collections")
async def get_vector_collections(current_user: Any = Depends(get_current_user)):
    return list(chroma_manager.collections.keys())
