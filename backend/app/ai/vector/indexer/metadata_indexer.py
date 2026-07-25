import time
import logging
from typing import Dict, Any, List
from app.integrations.datahub.client import datahub_client, FALLBACK_CATALOG
from app.ai.vector.embeddings.service import embedding_service
from app.ai.vector.collections.manager import chroma_manager
from app.ai.vector.store import vector_store

logger = logging.getLogger("metapilot_backend")

class MetadataIndexer:
    def __init__(self):
        self.is_indexing = False
        self.indexed_count = 0

    async def run_sync_indexing(self):
        """Indexes dataset summary chunks and schemas into ChromaDB or SQLite vector fallback stores."""
        if self.is_indexing:
            logger.info("MetadataIndexer: Indexing task already running. Skipping trigger.")
            return
        
        self.is_indexing = True
        self.indexed_count = 0
        start_time = time.time()
        logger.info("MetadataIndexer: Sync job started. Chunking catalog profiles...")

        try:
            # Query active datasets
            datasets = await datahub_client.search("*")
            for ds in datasets:
                urn = ds["urn"]
                try:
                    # Retrieve detailed entity properties
                    details = await datahub_client.get_entity(urn)
                    
                    # 1. Dataset Summary Chunk
                    summary_text = f"Dataset name: {details['name']}, platform: {details['platform']}. Description: {details['description']}. Owner: {details['owner']}."
                    summary_emb = embedding_service.get_embedding(summary_text)
                    self._store_vector(
                        collection_name="datasets",
                        urn=urn,
                        chunk_id=f"{urn}_summary",
                        document=summary_text,
                        embedding=summary_emb,
                        metadata={
                            "name": details["name"],
                            "platform": details["platform"],
                            "owner": details["owner"],
                            "entity_type": "dataset"
                        }
                    )

                    # 2. Schema Fields Column Chunk
                    fields_desc = []
                    for f in details.get("fields", []):
                        fields_desc.append(f"{f['name']} ({f['type']}): {f['description']}")
                    
                    if fields_desc:
                        schema_text = f"Schema columns for {details['name']}:\n" + "\n".join(fields_desc)
                        schema_emb = embedding_service.get_embedding(schema_text)
                        self._store_vector(
                            collection_name="schemas",
                            urn=urn,
                            chunk_id=f"{urn}_schema",
                            document=schema_text,
                            embedding=schema_emb,
                            metadata={
                                "name": details["name"],
                                "platform": details["platform"],
                                "entity_type": "schema"
                            }
                        )

                    self.indexed_count += 1
                except Exception as e:
                    logger.warning(f"MetadataIndexer: Failed to index dataset URN {urn}: {e}")

            logger.info(f"MetadataIndexer: Sync job completed. Indexed {self.indexed_count} datasets in {time.time() - start_time:.2f}s.")
        finally:
            self.is_indexing = False

    def _store_vector(
        self, 
        collection_name: str, 
        urn: str, 
        chunk_id: str, 
        document: str, 
        embedding: List[float], 
        metadata: Dict[str, Any]
    ):
        """Dispatches chunk mappings to ChromaDB persistent collections or fallback SQLite vector stores."""
        if chroma_manager.is_available:
            try:
                collection = chroma_manager.get_collection(collection_name)
                if collection:
                    collection.upsert(
                        ids=[chunk_id],
                        embeddings=[embedding],
                        metadatas=[metadata],
                        documents=[document]
                    )
                    return
            except Exception as e:
                logger.warning(f"Upsert to ChromaDB collection {collection_name} failed: {e}. Falling back to SQLite.")

        # SQLite vector fallback
        # Adapts dimensions length: SQLite vector stores accept 1536/384 float dimensions serializations
        vector_store.add_chunk(urn, document, embedding)

# Global single instance coordinator
metadata_indexer = MetadataIndexer()
