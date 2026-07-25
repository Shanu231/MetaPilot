from typing import Dict, Any, List
import yaml

class DbtArtifactGenerator:
    """Generates dbt sources and model test YAML configurations."""

    def generate_schema_yml(
        self,
        model_name: str,
        columns: List[Dict[str, Any]]
    ) -> str:
        cols_list = []
        for col in columns:
            col_data = {
                "name": col.get("name"),
                "description": col.get("description", "No column description cataloged."),
                "tests": ["not_null"] if not col.get("nullable", True) else []
            }
            # Remove empty tests list to keep clean yaml representation
            if not col_data["tests"]:
                del col_data["tests"]
            cols_list.append(col_data)

        schema_dict = {
            "version": 2,
            "models": [
                {
                    "name": model_name,
                    "description": f"Transformation model for {model_name}.",
                    "columns": cols_list
                }
            ]
        }
        
        # Output clean YAML formatting
        return yaml.dump(schema_dict, sort_keys=False)

    def generate_source_yml(
        self,
        source_name: str,
        table_name: str,
        columns: List[str]
    ) -> str:
        src_dict = {
            "version": 2,
            "sources": [
                {
                    "name": source_name,
                    "tables": [
                        {
                            "name": table_name,
                            "description": f"Source table raw stream import.",
                            "columns": [{"name": c} for c in columns]
                        }
                    ]
                }
            ]
        }
        return yaml.dump(src_dict, sort_keys=False)

# Global single instance coordinator
dbt_generator = DbtArtifactGenerator()
