import pytest
from app.ai.generators.sql import sql_generator
from app.ai.generators.dbt import dbt_generator
from app.ai.generators.airflow import airflow_generator
from app.ai.generators.impact import lineage_impact_engine
from app.ai.generators.root_cause import root_cause_engine

def test_sql_join_generation():
    sql = sql_generator.generate_join_query(
        primary_table="users_dim",
        join_table="orders_fact",
        join_keys=["user_id"],
        columns=["user_id", "email"]
    )
    assert "INNER JOIN orders_fact" in sql
    assert "p.user_id = j.user_id" in sql
    assert "p.email" in sql

def test_dbt_yml_schema_generation():
    columns = [
        {"name": "user_id", "nullable": False, "description": "PK"},
        {"name": "email", "nullable": True}
    ]
    yml = dbt_generator.generate_schema_yml("users_dim", columns)
    assert "version: 2" in yml
    assert "models:" in yml
    assert "tests:" in yml or "not_null" in yml

def test_airflow_dag_compilation():
    dag = airflow_generator.generate_taskflow_dag(
        dag_id="stripe_load",
        schedule_interval="@hourly",
        tasks_list=["extract", "load"]
    )
    assert "dag_id='stripe_load'" in dag
    assert "schedule_interval='@hourly'" in dag
    assert "extract() >> load()" in dag

def test_lineage_impact_ratings():
    nodes = [{"id": "node-1", "label": "orders_fact", "type": "snowflake"}]
    res = lineage_impact_engine.perform_impact_analysis("users_dim", "user_id", nodes)
    assert res["impact_risk_rating"] == "HIGH"
    assert res["affected_systems_count"] == 1
    assert res["impacted_systems"][0]["name"] == "orders_fact"

def test_root_cause_diagnose():
    res = root_cause_engine.diagnose_failure("ingest_dag", "NOT NULL constraint check failed", ["users_dim"])
    assert "Data Quality constraint violation" in res["detected_triggers"][0]
    assert res["confidence_score"] == 0.90
