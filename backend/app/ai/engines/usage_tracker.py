import logging
from typing import Dict, Any, List

logger = logging.getLogger("metapilot_backend")

class UsageTracker:
    """Tracks latency, token usage, cache performance, and prompt executions telemetry."""
    
    def __init__(self):
        self.history: List[Dict[str, Any]] = []

    def record_usage(
        self,
        prompt_version: str,
        provider: str,
        latency_secs: float,
        tokens_input: int,
        tokens_output: int,
        cache_hit: bool
    ):
        record = {
            "prompt_version": prompt_version,
            "provider": provider,
            "latency_secs": latency_secs,
            "tokens_input": tokens_input,
            "tokens_output": tokens_output,
            "cache_hit": cache_hit
        }
        self.history.append(record)
        logger.info(f"UsageTracker Telemetry: Provider: {provider}, Latency: {latency_secs:.3f}s, Tokens: {tokens_input + tokens_output}")

    def get_summary(self) -> Dict[str, Any]:
        total_queries = len(self.history)
        if total_queries == 0:
            return {"total_calls": 0, "avg_latency": 0.0, "total_tokens": 0}
        
        total_lat = sum(r["latency_secs"] for r in self.history)
        total_tok = sum(r["tokens_input"] + r["tokens_output"] for r in self.history)
        cache_hits = sum(1 for r in self.history if r["cache_hit"])
        
        return {
            "total_calls": total_queries,
            "avg_latency_secs": total_lat / total_queries,
            "total_tokens": total_tok,
            "cache_hit_ratio": cache_hits / total_queries
        }

# Global single instance coordinator
usage_tracker = UsageTracker()
