from typing import Dict, Any

class PromptEngine:
    """Prompt template engine managing versioned system instructions and placeholders."""
    
    VERSION = "2.1.0"
    
    TEMPLATES = {
        "sql": """[Template: SQL Generation - Version {version}]
You are a senior data engineer. Generate optimal, safe SQL queries based on the following catalog metadata.
Metadata context:
{context}

User requirement:
{query}
""",
        "dbt": """[Template: dbt compilation - Version {version}]
Generate a production dbt transform model or schema.yml from this metadata scope.
Metadata context:
{context}

User requirement:
{query}
""",
        "airflow": """[Template: Airflow TaskFlow - Version {version}]
Create a clean Apache Airflow DAG script using the TaskFlow API matching these metadata sources.
Metadata context:
{context}

User requirement:
{query}
""",
        "impact": """[Template: Lineage Impact Analysis - Version {version}]
Trace catalog dependencies downstream to estimate column change risk.
Metadata context:
{context}

Target columns change details:
{query}
""",
        "root_cause": """[Template: Root Cause Audit - Version {version}]
Evaluate error logs against catalog structures to identify failure causes.
Metadata context:
{context}

Error details:
{query}
""",
        "doc": """[Template: Schema Documentation - Version {version}]
Generate extensive markdown readme guides matching this metadata profile.
Metadata context:
{context}

Target entities:
{query}
"""
    }

    def compile_prompt(self, template_key: str, query: str, context: str) -> str:
        template = self.TEMPLATES.get(template_key)
        if not template:
            # General fallback
            return f"Context:\n{context}\n\nQuery:\n{query}"
        return template.format(version=self.VERSION, query=query, context=context)

# Global single instance coordinator
prompt_engine = PromptEngine()
