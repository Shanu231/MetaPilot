import logging
from typing import Dict, Any, Optional
from app.integrations.datahub.client import datahub_client
from app.integrations.cache.redis_cache import metadata_cache

logger = logging.getLogger("metapilot_backend")

class AgentContextKit:
    async def get_entity_details(self, urn: str) -> Optional[Dict[str, Any]]:
        """Retrieve entity details from cache or DataHub client."""
        cache_key = f"context:{urn}"
        try:
            cached = await metadata_cache.get(cache_key)
            if cached:
                logger.info(f"Cache hit for context key: {cache_key}")
                return cached
        except Exception:
            pass

        try:
            details = await datahub_client.get_entity(urn)
            if details:
                await metadata_cache.set(cache_key, details, ttl=300)  # Short context cache TTL
                return details
        except Exception as e:
            logger.warning(f"Failed to fetch context dataset for URN {urn}: {e}")
        return None

    def format_dataset_context(self, details: Dict[str, Any]) -> str:
        """Format dataset entity details into structured markdown logs."""
        urn = details.get("urn", "Unknown URN")
        name = details.get("name", "Unknown Name")
        platform = details.get("platform", "Unknown Platform")
        description = details.get("description", "No description provided.")
        owner = details.get("owner", "No owner mapped")
        tags = ", ".join(details.get("tags", [])) or "None"

        # Format schema fields
        fields_lines = []
        for field in details.get("fields", []):
            field_name = field.get("name", "Unknown field")
            field_type = field.get("type", "Unknown type")
            field_desc = field.get("description", "")
            nullable = "NULL" if field.get("nullable", True) else "NOT NULL"
            fields_lines.append(f"  - {field_name} ({field_type}) | {nullable} | Description: {field_desc}")
        fields_str = "\n".join(fields_lines) or "  - No schema fields found."

        # Format lineage paths
        upstreams = ", ".join(details.get("upstream", [])) or "None"
        downstreams = ", ".join(details.get("downstream", [])) or "None"

        context_block = f"""### DATASET SUMMARY
- **URN**: {urn}
- **Table Name**: {name}
- **Platform**: {platform}
- **Description**: {description}
- **Owner**: {owner}
- **Tags**: {tags}

### SCHEMA COLUMNS
{fields_str}

### LINEAGE DEPENDENCY PATHS
- **Upstream Sources**: {upstreams}
- **Downstream Targets**: {downstreams}
"""
        return context_block

# Single global instance coordinator
context_kit = AgentContextKit()
