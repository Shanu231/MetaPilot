import logging
from typing import List

logger = logging.getLogger("metapilot_backend")

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EmbeddingService, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization
        if self._model is not None:
            return
        
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("SentenceTransformers: Loading model 'all-MiniLM-L6-v2'...")
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformers: Model loaded successfully.")
        except ImportError:
            logger.warning("SentenceTransformers is not installed. Entering local deterministic vector fallback mode.")
            self._model = "fallback"
        except Exception as e:
            logger.warning(f"Failed to load sentence transformer model: {e}. Fallback mode active.")
            self._model = "fallback"

    def get_embedding(self, text: str) -> List[float]:
        if self._model == "fallback" or self._model is None:
            # Deterministic mock floats based on hash to prevent crashes
            h = hash(text)
            return [((h * i) % 1000) / 1000.0 for i in range(384)] # all-MiniLM-L6-v2 has 384 dimensions
        
        try:
            # Generate local sentence transformer embedding
            embedding = self._model.encode(text)
            return [float(x) for x in embedding]
        except Exception as e:
            logger.warning(f"SentenceTransformer encoding failed: {e}")
            h = hash(text)
            return [((h * i) % 1000) / 1000.0 for i in range(384)]

# Global single instance coordinator
embedding_service = EmbeddingService()
