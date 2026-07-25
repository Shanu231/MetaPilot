class TokenCounter:
    """Estimates tokens consumed by text prompts and LLM stream responses."""

    def estimate_tokens(self, text: str) -> int:
        if not text:
            return 0
        # Average English token represents roughly 4 characters
        return max(1, len(text) // 4)

# Global single instance coordinator
token_counter = TokenCounter()
