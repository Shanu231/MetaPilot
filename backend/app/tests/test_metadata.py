import pytest
from app.integrations.datahub.client import datahub_client
from app.integrations.context.context_kit import context_kit
from app.integrations.graph.models import Node, Edge, GraphPath

@pytest.mark.asyncio
async def test_datahub_client_status():
    status = await datahub_client.verify_status()
    assert "status" in status
    assert status["status"] in ["connected", "offline_fallback"]

@pytest.mark.asyncio
async def test_datahub_fallback_search():
    # Test fallback query resolution
    results = await datahub_client.search("users_dim")
    assert len(results) >= 1
    assert results[0]["name"] == "users_dim"
    assert results[0]["platform"] == "snowflake"

@pytest.mark.asyncio
async def test_datahub_fallback_entity():
    urn = "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)"
    entity = await datahub_client.get_entity(urn)
    assert entity["urn"] == urn
    assert entity["name"] == "users_dim"
    assert len(entity["fields"]) == 4
    assert entity["fields"][0]["name"] == "user_id"

@pytest.mark.asyncio
async def test_context_formatting():
    urn = "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)"
    details = await context_kit.get_entity_details(urn)
    assert details is not None
    formatted = context_kit.format_dataset_context(details)
    assert "users_dim" in formatted
    assert "user_id" in formatted
    assert "PII" in formatted

def test_graph_models_instantiation():
    node = Node(
        id="node-1",
        name="test_node",
        type="dataset",
        platform="snowflake"
    )
    edge = Edge(
        source="node-1",
        target="node-2"
    )
    path = GraphPath(nodes=[node], edges=[edge])
    assert path.nodes[0].name == "test_node"
    assert path.edges[0].source == "node-1"
