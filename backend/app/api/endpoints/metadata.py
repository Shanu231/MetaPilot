import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.dependencies.auth_dep import get_current_user
from app.integrations.datahub.client import datahub_client, FALLBACK_CATALOG
from app.integrations.context.context_kit import context_kit
from app.integrations.cache.redis_cache import metadata_cache

router = APIRouter()

@router.get("/status")
async def datahub_status(current_user: Any = Depends(get_current_user)):
    return await datahub_client.verify_status()

@router.get("/search")
async def search_metadata(
    q: str = Query(..., min_length=1),
    type: str = Query("dataset"),
    current_user: Any = Depends(get_current_user)
):
    cache_key = f"search:{type}:{q}"
    # Read from cache
    cached = await metadata_cache.get(cache_key)
    if cached:
        return cached

    start_time = time.time()
    results = await datahub_client.search(q, type)
    latency = time.time() - start_time

    # Cache results
    await metadata_cache.set(cache_key, results, ttl=600)
    
    return {
        "query": q,
        "type": type,
        "latency_secs": f"{latency:.4f}",
        "count": len(results),
        "results": results
    }

@router.get("/entities/{urn}")
async def get_entity_details(
    urn: str,
    current_user: Any = Depends(get_current_user)
):
    cache_key = f"entity:{urn}"
    cached = await metadata_cache.get(cache_key)
    if cached:
        return cached

    try:
        details = await datahub_client.get_entity(urn)
        await metadata_cache.set(cache_key, details, ttl=1800)
        return details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity URN not found: {str(e)}"
        )

@router.get("/datasets")
async def list_datasets(current_user: Any = Depends(get_current_user)):
    # Query fallback list or search all datasets
    return await datahub_client.search("*", "dataset")

@router.get("/pipelines")
async def list_pipelines(current_user: Any = Depends(get_current_user)):
    # Mock pipeline entities
    return [
        {"urn": "urn:li:dataFlow:(urn:li:dataPlatform:airflow,postgres_to_s3)", "name": "postgres_to_s3_ingestion", "platform": "airflow", "description": "Airflow DAG copying raw PG events to S3 storage."},
        {"urn": "urn:li:dataFlow:(urn:li:dataPlatform:airflow,analytics_aggregate)", "name": "dbt_analytics_transform", "platform": "airflow", "description": "Orchestrates dbt aggregations models."}
    ]

@router.get("/dashboards")
async def list_dashboards(current_user: Any = Depends(get_current_user)):
    return [
        {"urn": "urn:li:dashboard:(urn:li:dataPlatform:looker,finance_analytics)", "name": "Executive Financials Audit", "platform": "looker", "description": "Financial analytics KPI reporting dashboard."}
    ]

@router.get("/schema")
async def get_dataset_schema(
    urn: str = Query(...),
    current_user: Any = Depends(get_current_user)
):
    try:
        details = await datahub_client.get_entity(urn)
        return {
            "urn": urn,
            "fields": details.get("fields", [])
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schema metadata URN not found."
        )

@router.get("/lineage")
async def get_graph_lineage(
    urn: str = Query(...),
    current_user: Any = Depends(get_current_user)
):
    # Generates custom coordinates layouts dynamically to serve Explorer and Lineage graphics
    nodes = []
    edges = []

    # Map fallback or standard nodes coordinates
    fallback_nodes_layout = {
        "urn:li:dataset:(urn:li:dataPlatform:postgres,raw.stripe.stripe_webhook_events)": {"x": 120, "y": 140, "name": "stripe_webhook_events", "platform": "postgres", "desc": "Postgres raw events stream", "type": "postgres"},
        "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)": {"x": 120, "y": 280, "name": "users_dim", "platform": "snowflake", "desc": "User dimension schemas", "type": "snowflake"},
        "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)": {"x": 380, "y": 210, "name": "orders_fact", "platform": "snowflake", "desc": "Orders transactional facts", "type": "snowflake"}
    }

    # Edges mapping
    fallback_edges = [
        {"id": "edge-1", "source": "urn:li:dataset:(urn:li:dataPlatform:postgres,raw.stripe.stripe_webhook_events)", "target": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)"},
        {"id": "edge-2", "source": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.users_dim)", "target": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.orders_fact)"}
    ]

    # Verify if query belongs to fallback catalog keys
    if urn in FALLBACK_CATALOG or urn == "all":
        for uid, nd in fallback_nodes_layout.items():
            nodes.append({
                "id": uid,
                "label": nd["name"],
                "type": nd["type"],
                "x": nd["x"],
                "y": nd["y"],
                "description": nd["desc"],
                "owner": "Marcus Vance" if "users" in uid else "Emma Linwood",
                "tags": ["PII", "Core"] if "users" in uid else ["Financials"]
            })
        edges = fallback_edges
    else:
        # Dynamically build a single node view with empty upstreams/downstreams
        nodes.append({
            "id": urn,
            "label": urn.split(",")[-1].replace(")", ""),
            "type": "snowflake",
            "x": 250,
            "y": 200,
            "description": "Custom query metadata node details.",
            "owner": "DataPlatform Team",
            "tags": []
        })

    return {
        "nodes": nodes,
        "edges": edges
    }

@router.get("/context")
async def get_prompt_context(
    urn: str = Query(...),
    current_user: Any = Depends(get_current_user)
):
    details = await context_kit.get_entity_details(urn)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt context dataset not found."
        )
    return {
        "urn": urn,
        "formatted_context": context_kit.format_dataset_context(details)
    }
