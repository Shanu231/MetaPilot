import logging
from typing import Dict, Any, List
from app.integrations.datahub.client import datahub_client
from app.integrations.context.context_kit import context_kit

logger = logging.getLogger("metapilot_backend")

class AIToolRegistry:
    """Registry exposing internal metadata tools to LLM reasoning pipelines."""
    
    async def search_metadata(self, query: str) -> List[Dict[str, Any]]:
        """Search DataHub metadata catalog entries."""
        try:
            return await datahub_client.search(query)
        except Exception as e:
            logger.warning(f"Tool search_metadata failed: {e}")
            return []

    async def get_schema_fields(self, urn: str) -> List[Dict[str, Any]]:
        """Retrieve schema columns and nullable statuses."""
        try:
            details = await datahub_client.get_entity(urn)
            return details.get("fields", [])
        except Exception as e:
            logger.warning(f"Tool get_schema_fields failed for URN {urn}: {e}")
            return []

    async def get_lineage_edges(self, urn: str) -> Dict[str, Any]:
        """Fetch lineage dependencies upstreams and downstreams."""
        try:
            return await datahub_client.get_lineage(urn)
        except Exception as e:
            logger.warning(f"Tool get_lineage_edges failed for URN {urn}: {e}")
            return {"urn": urn, "upstream": [], "downstream": []}

    async def get_dataset_context_block(self, urn: str) -> str:
        """Format full markdown representation context of the dataset."""
        try:
            details = await context_kit.get_entity_details(urn)
            if details:
                return context_kit.format_dataset_context(details)
        except Exception as e:
            logger.warning(f"Tool get_dataset_context_block failed for URN {urn}: {e}")
        return f"Metadata details for URN {urn} are not reachable."

# Global single instance coordinator
ai_tools = AIToolRegistry()
