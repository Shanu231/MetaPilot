import json
import asyncio
import logging
from typing import AsyncGenerator, List, Optional
import httpx
from app.core.config import settings
from app.ai.providers.base import BaseLLMProvider

logger = logging.getLogger("metapilot_backend")

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model_name = "gpt-4o-mini"
        self.embed_model = "text-embedding-3-small"

    def get_provider_name(self) -> str:
        return "openai"

    async def generate_stream(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or len(self.api_key) < 10:
            logger.info("OpenAI API key is unconfigured. Entering fallback simulation.")
            async for chunk in self._simulate_metadata_reasoning(prompt):
                yield chunk
            return

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as response:
                    if response.status_code != 200:
                        async for chunk in self._simulate_metadata_reasoning(prompt):
                            yield chunk
                        return

                    async for line in response.iter_lines():
                        line = line.strip()
                        if not line or line == "data: [DONE]":
                            continue
                        if line.startswith("data: "):
                            try:
                                data = json.loads(line[6:])
                                text = data["choices"][0]["delta"].get("content", "")
                                if text:
                                    yield text
                            except Exception:
                                pass
        except Exception as e:
            logger.warning(f"OpenAI API connection error: {e}. Falling back to simulation.")
            async for chunk in self._simulate_metadata_reasoning(prompt):
                yield chunk

    async def get_embedding(self, text: str) -> List[float]:
        if not self.api_key or len(self.api_key) < 10:
            h = hash(text)
            return [((h * i) % 1000) / 1000.0 for i in range(1536)]

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "input": text,
            "model": self.embed_model
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["data"][0]["embedding"]
        except Exception as e:
            logger.warning(f"OpenAI embedding request failed: {e}")
        
        h = hash(text)
        return [((h * i) % 1000) / 1000.0 for i in range(1536)]

    async def _simulate_metadata_reasoning(self, prompt: str) -> AsyncGenerator[str, None]:
        from app.ai.providers.gemini import GeminiProvider
        provider = GeminiProvider()
        async for chunk in provider._simulate_metadata_reasoning(prompt):
            yield chunk
