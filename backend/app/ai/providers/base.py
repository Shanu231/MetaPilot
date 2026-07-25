from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Optional

class BaseLLMProvider(ABC):
    """Abstract interface defining required methods for all LLM connectors."""
    
    @abstractmethod
    async def generate_stream(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Generate a character/token-by-token text stream response."""
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """Generate a semantic vector embedding representing the text."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider type designator (e.g. gemini, openai)."""
        pass
