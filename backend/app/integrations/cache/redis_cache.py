import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("metapilot_backend")

class MetadataCache:
    def __init__(self):
        self.redis_client = None
        try:
            self.redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.warning(f"MetadataCache failed to connect to Redis: {e}. Caching is disabled.")

    async def get(self, key: str) -> Optional[Any]:
        if not self.redis_client:
            return None
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get exception for key {key}: {e}")
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        if not self.redis_client:
            return False
        try:
            serialized = json.dumps(value)
            expire_ttl = ttl if ttl is not None else settings.METADATA_CACHE_TTL_SECS
            await self.redis_client.set(key, serialized, ex=expire_ttl)
            return True
        except Exception as e:
            logger.warning(f"Cache set exception for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        if not self.redis_client:
            return False
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete exception for key {key}: {e}")
            return False

    async def clear_prefix(self, prefix: str) -> bool:
        if not self.redis_client:
            return False
        try:
            keys = await self.redis_client.keys(f"{prefix}*")
            if keys:
                await self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.warning(f"Cache clear prefix exception for pattern {prefix}*: {e}")
            return False

# Single global cache coordinator instance
metadata_cache = MetadataCache()
