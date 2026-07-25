from typing import Dict, Any

class MetadataMarkdownDocumenter:
    """Generates structured Markdown documentation files for catalogs datasets."""

    def compile_dataset_documentation(self, details: Dict[str, Any]) -> str:
        urn = details.get("urn", "N/A")
        name = details.get("name", "Unknown Name")
        platform = details.get("platform", "Unknown Platform")
        description = details.get("description", "No description configured.")
        owner = details.get("owner", "No owner assigned")
        
        fields_lines = []
        for field in details.get("fields", []):
            nullable_str = "YES" if field.get("nullable", True) else "NO"
            fields_lines.append(
                f"| `{field.get('name')}` | `{field.get('type')}` | `{nullable_str}` | {field.get('description', '')} |"
            )
        fields_str = "\n".join(fields_lines) or "| — | — | — | No fields cataloged. |"

        markdown_doc = f"""# Metadata Documentation - {name}

## 1. General Attributes
- **URN Key**: `{urn}`
- **Source Database / Platform**: {platform}
- **Data Owner**: **{owner}**

## 2. Description
{description}

## 3. Schema Reference Attributes
| Column Name | Data Type | Nullable | Description / Comments |
| :--- | :--- | :--- | :--- |
{fields_str}

---
*Documentation compiled automatically by MetaPilot Engineering Assistant.*
"""
        return markdown_doc

# Global single instance coordinator
metadata_documenter = MetadataMarkdownDocumenter()
