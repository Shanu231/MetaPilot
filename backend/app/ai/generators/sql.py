from typing import Dict, Any, List

class SQLArtifactGenerator:
    """Generates production-ready SQL statements leveraging real catalog metadata details."""

    def generate_join_query(
        self,
        primary_table: str,
        join_table: str,
        join_keys: List[str],
        columns: List[str]
    ) -> str:
        cols_str = ", ".join(f"p.{c}" for c in columns) if columns else "p.*, j.*"
        join_on = " AND ".join(f"p.{k} = j.{k}" for k in join_keys)
        
        sql = f"""-- Upstream Joins Analysis Query
SELECT 
    {cols_str}
FROM {primary_table} p
INNER JOIN {join_table} j
    ON {join_on}
LIMIT 100;"""
        return sql

    def generate_data_quality_query(self, table_name: str, null_columns: List[str]) -> str:
        checks = []
        for col in null_columns:
            checks.append(f"SUM(CASE WHEN {col} IS NULL THEN 1 ELSE 0 END) AS count_null_{col}")
        
        checks_str = ",\n    ".join(checks)
        sql = f"""-- Data Quality NULL Violations Audit
SELECT
    COUNT(*) AS total_records,
    {checks_str}
FROM {table_name};"""
        return sql

# Global single instance coordinator
sql_generator = SQLArtifactGenerator()
