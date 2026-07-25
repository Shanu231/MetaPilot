import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.integrations.datahub.client import datahub_client

logger = logging.getLogger("metapilot_backend")

class DataHubMCPServerAdapter:
    """
    Abstracts Model Context Protocol (MCP) interactions for the metadata registries.
    AI services route requests through this adapter layer instead of connecting to GMS directly.
    """
    def __init__(self):
        self.server_name = "metapilot-datahub-mcp"
        self.server_version = "1.0.0"
        self.connected = False

    async def connect(self) -> bool:
        """Initialize connection parameters with DataHub endpoints."""
        try:
            status = await datahub_client.verify_status()
            self.connected = (status["status"] == "connected")
            logger.info(f"MCP server adapter state connection synced: {self.connected}")
            return self.connected
        except Exception as e:
            logger.warning(f"MCP Server connection fault: {e}")
            self.connected = False
            return False

    async def list_mcp_resources(self) -> List[Dict[str, Any]]:
        """Fetch references to metadata structures available on the registry."""
        if not self.connected:
            await self.connect()

        # Fetches standard entity descriptors
        results = await datahub_client.search("*", "dataset")
        resources = []
        for item in results:
            resources.append({
                "uri": f"mcp://datahub/{item['urn']}",
                "name": item["name"],
                "mimeType": "application/json",
                "description": item["description"]
            })
        return resources

    async def list_mcp_tools(self) -> List[Dict[str, Any]]:
        """List available tools exposed by the MCP schema agent."""
        return [
            {
                "name": "get_schema_fields",
                "description": "Retrieve database column attributes and schemas for a given URN.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "urn": {"type": "string", "description": "The target dataset URN."}
                    },
                    "required": ["urn"]
                }
            },
            {
                "name": "get_lineage_relations",
                "description": "Trace upstream and downstream dependency edges for a given URN.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "urn": {"type": "string", "description": "The target dataset URN."}
                    },
                    "required": ["urn"]
                }
            }
        ]

    async def execute_mcp_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Route tool calls executing against GMS metadata clients."""
        urn = arguments.get("urn")
        if not urn:
            return {"error": "Missing required argument: 'urn'"}

        try:
            if tool_name == "get_schema_fields":
                details = await datahub_client.get_entity(urn)
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Fields for {urn}: {details.get('fields', [])}"
                        }
                    ]
                }
            elif tool_name == "get_lineage_relations":
                lineage = await datahub_client.get_lineage(urn)
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Lineage relations for {urn}: {lineage}"
                        }
                    ]
                }
        except Exception as e:
            return {"error": f"MCP execution error: {str(e)}"}

        return {"error": f"Tool '{tool_name}' is not supported."}

# Single global coordinator instance
mcp_server_adapter = DataHubMCPServerAdapter()
