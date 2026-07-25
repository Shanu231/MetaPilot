from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.openai import OpenAIProvider
from app.ai.providers.groq import GroqProvider
from app.core.config import settings

class ProviderFactory:
    """Factory creating and caching instances of configured LLM providers."""
    _instances = {}

    @classmethod
    def get_provider(cls, name: str = None) -> BaseLLMProvider:
        provider_name = (name or settings.PRIMARY_AI_PROVIDER).lower()
        if provider_name not in cls._instances:
            if provider_name == "gemini":
                cls._instances[provider_name] = GeminiProvider()
            elif provider_name == "openai":
                cls._instances[provider_name] = OpenAIProvider()
            elif provider_name == "groq":
                cls._instances[provider_name] = GroqProvider()
            else:
                cls._instances[provider_name] = GeminiProvider()
        return cls._instances[provider_name]
