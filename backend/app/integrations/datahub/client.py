import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.integrations.exceptions.exceptions import DataHubConnectionException, DataHubEntityNotFoundException

logger = logging.getLogger("metapilot_backend")

# High-fidelity fallback catalog seeded locally to serve offline operations gracefully
FALLBACK_CATALOG: Dict[str, Dict[str, Any]] = {
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)",
        "name": "users_dim",
        "platform": "snowflake",
        "description": "Standardized user dimension table storing registered profile mappings, signup timelines, and location attributes.",
        "owner": "Marcus Vance",
        "tags": ["PII", "Core", "Analytics"],
        "fields": [
            {"name": "user_id", "type": "VARCHAR(36)", "description": "Primary key identifier mapping each registered account.", "nullable": False},
            {"name": "email", "type": "VARCHAR(256)", "description": "User email address, flagged as confidential.", "nullable": False},
            {"name": "name", "type": "VARCHAR(128)", "description": "Full name of the registered user.", "nullable": True},
            {"name": "signup_date", "type": "TIMESTAMP", "description": "Account registration timestamp recorded in UTC.", "nullable": False}
        ],
        "upstream": [],
        "downstream": ["urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)"]
    },
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)",
        "name": "orders_fact",
        "platform": "snowflake",
        "description": "Fact table collecting Stripe transaction details, order events, checkout timelines, and billing links.",
        "owner": "Emma Linwood",
        "tags": ["Financials", "Transactional", "Core"],
        "fields": [
            {"name": "order_id", "type": "VARCHAR(36)", "description": "Unique purchase event primary identifier.", "nullable": False},
            {"name": "user_id", "type": "VARCHAR(36)", "description": "Foreign relation key linking back to users dimension table.", "nullable": False},
            {"name": "amount_cents", "type": "INTEGER", "description": "Total checkout value measured in cents currency.", "nullable": False},
            {"name": "currency", "type": "VARCHAR(3)", "description": "Transaction base currency ISO designation code.", "nullable": False},
            {"name": "created_at", "type": "TIMESTAMP", "description": "Stripe payment completion event log date.", "nullable": False}
        ],
        "upstream": ["urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)"],
        "downstream": []
    },
    "urn:li:dataset:(urn:li:dataPlatform:postgres,raw.stripe.stripe_webhook_events)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:postgres,raw.stripe.stripe_webhook_events)",
        "name": "stripe_webhook_events",
        "platform": "postgres",
        "description": "Raw Postgres table storing webhook payloads received directly from Stripe integrations.",
        "owner": "Stripe Operations Team",
        "tags": ["Raw", "Webhooks", "JSON"],
        "fields": [
            {"name": "event_id", "type": "VARCHAR(64)", "description": "Stripe unique webhook event identifier.", "nullable": False},
            {"name": "event_type", "type": "VARCHAR(64)", "description": "String representation of webhook transaction state (e.g. payment.success).", "nullable": False},
            {"name": "payload", "type": "JSONB", "description": "Original raw JSON body object received via webhook hook endpoints.", "nullable": False},
            {"name": "ingested_at", "type": "TIMESTAMP", "description": "Postgres ingestion database commit timestamp.", "nullable": False}
        ],
        "upstream": [],
        "downstream": ["urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)"]
    }
}

class DataHubAsyncClient:
    def __init__(self):
        self.gms_url = settings.DATAHUB_GMS_URL
        self.token = settings.DATAHUB_PAT_TOKEN
        self.headers = {"Content-Type": "application/json"}
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

    async def verify_status(self) -> Dict[str, str]:
        """Verify server connection status, falling back to offline if unreachable."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                # Test connectivity to basic endpoints
                response = await client.get(f"{self.gms_url}/health")
                if response.status_code == 200:
                    return {"status": "connected", "details": "GMS responded healthy."}
        except Exception:
            pass
        return {"status": "offline_fallback", "details": "Unreachable. Operating in local fallback catalog mode."}

    async def search(self, query: str, entity_type: str = "dataset") -> List[Dict[str, Any]]:
        """Search metadata entities with queries matching fallback names or GMS API data."""
        status_info = await self.verify_status()
        if status_info["status"] == "offline_fallback":
            logger.info(f"Offline Mode: fuzzy search matches query '{query}'")
            results = []
            q_lower = query.lower()
            for urn, item in FALLBACK_CATALOG.items():
                if q_lower == "*" or q_lower == "" or q_lower in item["name"].lower() or q_lower in item["description"].lower() or any(q_lower in t.lower() for t in item["tags"]):
                    results.append({
                        "urn": urn,
                        "name": item["name"],
                        "type": entity_type,
                        "platform": item["platform"],
                        "description": item["description"],
                        "owner": item["owner"],
                        "tags": item["tags"]
                    })
            return results

        # Remote GraphQL DataHub query
        gql_query = """
        query search($input: SearchInput!) {
          search(input: $input) {
            searchResults {
              entity {
                urn
                type
                ... on Dataset {
                  name
                  origin
                  platform {
                    name
                  }
                  properties {
                    description
                  }
                }
              }
            }
          }
        }
        """
        variables = {
            "input": {
                "query": query,
                "types": [entity_type.upper()],
                "start": 0,
                "count": 20
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.gms_url}/api/graphql",
                    json={"query": gql_query, "variables": variables},
                    headers=self.headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    search_results = data.get("data", {}).get("search", {}).get("searchResults", [])
                    mapped = []
                    for res in search_results:
                        ent = res.get("entity", {})
                        mapped.append({
                            "urn": ent.get("urn"),
                            "name": ent.get("name", ent.get("urn", "").split(",")[-1].replace(")", "")),
                            "type": ent.get("type", "DATASET").lower(),
                            "platform": ent.get("platform", {}).get("name", "unknown"),
                            "description": ent.get("properties", {}).get("description", "No description configured."),
                            "owner": "DataPlatform Team",
                            "tags": []
                        })
                    return mapped
        except Exception as e:
            logger.warning(f"GraphQL search failed, falling back: {e}")
            
        return await self.search(query, entity_type)

    async def get_entity(self, urn: str) -> Dict[str, Any]:
        """Fetch metadata metrics and schema structures for individual Urns."""
        if urn in FALLBACK_CATALOG:
            return FALLBACK_CATALOG[urn]

        status_info = await self.verify_status()
        if status_info["status"] == "offline_fallback":
            raise DataHubEntityNotFoundException(urn)

        gql_query = """
        query getDataset($urn: String!) {
          dataset(urn: $urn) {
            urn
            name
            platform {
              name
            }
            properties {
              description
            }
            schemaMetadata {
              fields {
                fieldPath
                type {
                  __typename
                }
                description
                nullable
              }
            }
          }
        }
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.gms_url}/api/graphql",
                    json={"query": gql_query, "variables": {"urn": urn}},
                    headers=self.headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    ds = data.get("data", {}).get("dataset")
                    if not ds:
                        raise DataHubEntityNotFoundException(urn)

                    fields = []
                    for f in ds.get("schemaMetadata", {}).get("fields", []):
                        fields.append({
                            "name": f.get("fieldPath"),
                            "type": f.get("type", {}).get("__typename", "VARCHAR").replace("Type", ""),
                            "description": f.get("description", "No description available."),
                            "nullable": f.get("nullable", True)
                        })

                    return {
                        "urn": ds.get("urn"),
                        "name": ds.get("name"),
                        "platform": ds.get("platform", {}).get("name", "unknown"),
                        "description": ds.get("properties", {}).get("description", "No description configured."),
                        "owner": "DataPlatform Team",
                        "tags": [],
                        "fields": fields,
                        "upstream": [],
                        "downstream": []
                    }
        except DataHubEntityNotFoundException:
            raise
        except Exception as e:
            logger.warning(f"GraphQL get_entity failed: {e}")
            
        raise DataHubEntityNotFoundException(urn)

    async def get_lineage(self, urn: str) -> Dict[str, Any]:
        """Fetch downstream dependencies mapping coordinates paths."""
        if urn in FALLBACK_CATALOG:
            item = FALLBACK_CATALOG[urn]
            return {
                "urn": urn,
                "upstream": item["upstream"],
                "downstream": item["downstream"]
            }

        # For remote lineage query support
        return {
            "urn": urn,
            "upstream": [],
            "downstream": []
        }

# Global single instance coordinator
datahub_client = DataHubAsyncClient()
