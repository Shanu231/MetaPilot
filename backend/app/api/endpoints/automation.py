import io
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from app.dependencies.auth_dep import get_current_user
from app.integrations.datahub.client import datahub_client
from app.ai.generators.sql import sql_generator
from app.ai.generators.dbt import dbt_generator
from app.ai.generators.airflow import airflow_generator
from app.ai.generators.docs import metadata_documenter
from app.ai.generators.export import zip_exporter

router = APIRouter()

class GenerationRequest(BaseModel):
    artifact_type: str  # sql, dbt, airflow, doc
    urn: str

def compile_artifact_files(artifact_type: str, details: Dict[str, Any]) -> Dict[str, str]:
    files = {}
    name = details["name"]
    cols = [f["name"] for f in details.get("fields", [])]

    if artifact_type == "sql":
        files[f"{name}_query.sql"] = sql_generator.generate_join_query(
            primary_table=name,
            join_table="another_catalog_table",
            join_keys=["user_id"],
            columns=cols[:3]
        )
        files[f"{name}_dq_checks.sql"] = sql_generator.generate_data_quality_query(name, cols[:2])

    elif artifact_type == "dbt":
        files[f"schema.yml"] = dbt_generator.generate_schema_yml(name, details.get("fields", []))
        files[f"stg_{name}.sql"] = f"SELECT * FROM {{{{ source('raw', '{name}') }}}}"

    elif artifact_type == "airflow":
        files[f"{name}_dag.py"] = airflow_generator.generate_taskflow_dag(
            dag_id=f"{name}_orchestration",
            schedule_interval="@daily",
            tasks_list=["extract_source", "load_staging", "transform_fact"]
        )

    elif artifact_type == "doc":
        files[f"{name}_readme.md"] = metadata_documenter.compile_dataset_documentation(details)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported artifact type: {artifact_type}"
        )

    return files

@router.post("/generate")
async def generate_artifact(
    body: GenerationRequest,
    current_user: Any = Depends(get_current_user)
):
    try:
        details = await datahub_client.get_entity(body.urn)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target dataset URN not found."
        )

    files = compile_artifact_files(body.artifact_type, details)
    return {"files": files}

@router.get("/export")
async def export_artifact(
    artifact_type: str = Query(...),
    urn: str = Query(...),
    current_user: Any = Depends(get_current_user)
):
    try:
        details = await datahub_client.get_entity(urn)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target dataset URN not found."
        )

    files = compile_artifact_files(artifact_type, details)
    zip_bytes = zip_exporter.build_zip_package(files)

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=metapilot_{details['name']}_{artifact_type}.zip"
        }
    )
