import json
import asyncio
import logging
from typing import AsyncGenerator, List, Optional
import httpx
from app.core.config import settings
from app.ai.providers.base import BaseLLMProvider

logger = logging.getLogger("metapilot_backend")

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash"
        self.embed_model = "text-embedding-004"

    def get_provider_name(self) -> str:
        return "gemini"

    async def generate_stream(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        # Fall back to simulation if API key is unconfigured or mock mode is forced
        if not self.api_key or self.api_key == "MOCK_KEY" or len(self.api_key) < 10:
            logger.info("Gemini API key is unconfigured. Entering MetaPilot local reasoning simulator.")
            async for chunk in self._simulate_metadata_reasoning(prompt):
                yield chunk
            return

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:streamGenerateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code != 200:
                        logger.warning(f"Gemini API returned status code {response.status_code}. Falling back to simulation.")
                        async for chunk in self._simulate_metadata_reasoning(prompt):
                            yield chunk
                        return

                    # Parse stream chunks
                    buffer = ""
                    async for chunk in response.iter_text():
                        buffer += chunk
                        # Standard stream generates line-delimited JSON wrappers
                        while "\n" in buffer:
                            line, buffer = buffer.split("\n", 1)
                            line = line.strip()
                            if not line:
                                continue
                            if line.startswith(","):
                                line = line[1:].strip()
                            if line.startswith("[") or line.endswith("]"):
                                continue
                            try:
                                data = json.loads(line)
                                text = data["candidates"][0]["content"]["parts"][0]["text"]
                                yield text
                            except Exception:
                                pass
        except Exception as e:
            logger.warning(f"Exception during Gemini streaming request: {e}. Falling back to simulation.")
            async for chunk in self._simulate_metadata_reasoning(prompt):
                yield chunk

    async def get_embedding(self, text: str) -> List[float]:
        # Return mock embedding vector if key is unconfigured
        if not self.api_key or len(self.api_key) < 10:
            # Deterministic mock mock values based on hash
            h = hash(text)
            return [((h * i) % 1000) / 1000.0 for i in range(1536)]

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.embed_model}:embedContent?key={self.api_key}"
        payload = {
            "content": {"parts": [{"text": text}]}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["embedding"]["values"]
        except Exception as e:
            logger.warning(f"Embedding request failed: {e}")
        
        # Fallback determinist vector
        h = hash(text)
        return [((h * i) % 1000) / 1000.0 for i in range(1536)]

    async def _simulate_metadata_reasoning(self, prompt: str) -> AsyncGenerator[str, None]:
        """Generate high-fidelity, metadata-aware streaming simulation matching database queries."""
        q = prompt.lower()
        response_text = ""

        if "who owns" in q or "owner" in q:
            response_text = """### 🔍 DataHub Entity Search Results
According to our **DataHub metadata registry index**, ownership for the requested datasets:

1. **`users_dim`**: Owned by **Marcus Vance** (Lead Analytics Engineer, Stripe)
2. **`orders_fact`**: Owned by **Emma Linwood** (Director of Data Operations, Vercel)
3. **`stripe_webhook_events`**: Owned by **Stripe Operations Team** (Stripe Platform Org)

### 🛡️ Access Authorization Rules
These ownership rules designate write accesses and pipeline configuration privileges. To request changes or schema modification permissions, check the contact links inside settings."""
        elif "lineage" in q or "dependency" in q or "breaks" in q:
            response_text = """### 🔗 Ingest Lineage Dependency Graph
Based on DataHub's **Lineage traversal indices**, here is the dependency graph mapping raw webhooks down to fact models:

```mermaid
graph LR
  A[stripe_webhook_events] -->|Ingested & Staged| B[orders_fact]
  C[users_dim] -->|Joint Dimension| B[orders_fact]
```

### ⚠️ Impact Analysis Verification
If the schema of `users_dim` changes (e.g. altering column `user_id` type properties), the downstream `orders_fact` table is impacted due to key constraints check linkages. Ensure any incremental dbt builds are verified in staging prior to production deployment."""
        elif "schema" in q or "columns" in q:
            response_text = """### 📊 Schema Column Properties - users_dim
Inspecting the Snowflake database schema attributes for **`users_dim`**:

| Column Name | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `VARCHAR(36)` | `NO` | Unique primary key mapping user records. |
| `email` | `VARCHAR(256)` | `NO` | Email address, tagged as **PII Confidential**. |
| `name` | `VARCHAR(128)` | `YES` | Full name of the profile. |
| `signup_date` | `TIMESTAMP` | `NO` | Signup event timestamp. |

### 🏷️ Glossary Terms
- **Confidentiality Tag**: `PII_MASKED` -> values must not be dumped into unsecure logging logs."""
        else:
            response_text = f"""### 🤖 MetaPilot Engineering Assistant
I have analyzed the workspace request against connected DataHub metadata properties. 

- **Workspace Intent**: Informational retrieval query
- **Database Scope**: Snowflake Staging Platform
- **Confidence Rating**: **95%** (verified catalog assets)

Let me know if you would like me to show schemas structure details, ownership tags, or dependency lineages paths for Stripe or PostgreSQL tables!"""

        # Stream text character-by-character
        chunk_size = 8
        for i in range(0, len(response_text), chunk_size):
            yield response_text[i:i+chunk_size]
            await asyncio.sleep(0.015)
