import pytest
from app.ai.providers.factory import ProviderFactory
from app.ai.engines.prompt_engine import prompt_engine
from app.ai.engines.response_parser import response_parser
from app.ai.engines.token_counter import token_counter
from app.ai.engines.usage_tracker import usage_tracker

def test_provider_factory():
    provider = ProviderFactory.get_provider("gemini")
    assert provider.get_provider_name() == "gemini"

def test_prompt_engine_compiles():
    prompt = prompt_engine.compile_prompt("sql", "SELECT * FROM users", "users_dim schema info")
    assert "users_dim schema info" in prompt
    assert "SELECT * FROM users" in prompt
    assert prompt_engine.VERSION in prompt

def test_response_parser_code_extraction():
    sample_text = """
Here is the script files:
```sql
SELECT * FROM orders;
```
And configuration:
```yaml
version: 2
```
"""
    files = response_parser.extract_code_blocks(sample_text)
    assert len(files) == 2
    assert "artifact_1.sql" in files
    assert "artifact_2.yml" in files
    assert files["artifact_1.sql"] == "SELECT * FROM orders;"

def test_token_counter_estimator():
    tokens = token_counter.estimate_tokens("A quick brown fox jumps over the lazy dog.")
    assert tokens > 0

def test_usage_tracker_telemetry():
    usage_tracker.record_usage(
        prompt_version="2.1.0",
        provider="gemini",
        latency_secs=0.082,
        tokens_input=120,
        tokens_output=80,
        cache_hit=True
    )
    summary = usage_tracker.get_summary()
    assert summary["total_calls"] >= 1
    assert summary["cache_hit_ratio"] > 0.0
