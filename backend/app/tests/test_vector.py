import pytest
from app.ai.vector.embeddings.service import embedding_service
from app.ai.vector.collections.manager import chroma_manager
from app.ai.vector.indexer.metadata_indexer import metadata_indexer
from app.ai.vector.retriever.semantic_retriever import semantic_retriever

def test_embedding_service_singleton():
    # Verify singleton instantiations
    service1 = embedding_service
    from app.ai.vector.embeddings.service import EmbeddingService
    service2 = EmbeddingService()
    assert service1 is service2

def test_embedding_vector_dimensions():
    # Local fallback generates 384 dimensions matching sentence transformers
    vector = embedding_service.get_embedding("test semantic vector retrieval text")
    assert len(vector) == 384
    assert isinstance(vector[0], float)

def test_chroma_manager_status():
    status = chroma_manager.get_status()
    assert "is_available" in status
    assert "persist_path" in status
    assert "active_collections" in status

@pytest.mark.asyncio
async def test_metadata_indexer_sync():
    # Sync fallback index seeding shouldn't crash
    await metadata_indexer.run_sync_indexing()
    assert metadata_indexer.indexed_count >= 1

@pytest.mark.asyncio
async def test_retriever_query():
    matches = await semantic_retriever.retrieve_semantic_context("Who owns users_dim?", limit=2)
    assert len(matches) >= 1
    # Check if exact keyword boost is applied
    assert matches[0]["score"] > 0.0
    assert "users_dim" in matches[0]["content"]

@pytest.mark.asyncio
async def test_retriever_with_filters():
    # Test lookups filtered by platform snowflake
    filters = {"platform": "snowflake"}
    matches = await semantic_retriever.retrieve_semantic_context("orders_fact", limit=2, filters=filters)
    assert len(matches) >= 1
    assert "orders_fact" in matches[0]["content"]
