from typing import Dict, Any, List

class EngineeringReviewAuditor:
    """Audits schemas and generated SQL configurations for naming conventions and best practices."""

    def review_dataset_schema(self, details: Dict[str, Any]) -> Dict[str, Any]:
        warnings = []
        score = 100

        name = details.get("name", "")
        # Rule 1: Table naming design prefixes (should have _fact, _dim, or raw_ prefixes)
        if not (name.endswith("_dim") or name.endswith("_fact") or name.startswith("raw_")):
            warnings.append("Naming Convention Warning: Tables should possess clear design prefixes (e.g., _dim, _fact, or raw_).")
            score -= 15

        # Rule 2: Column descriptors checks
        fields = details.get("fields", [])
        columns_without_desc = 0
        for f in fields:
            if not f.get("description"):
                columns_without_desc += 1

        if columns_without_desc > 0:
            warnings.append(f"Metadata Coverage Warning: {columns_without_desc} columns are missing descriptions.")
            score -= (columns_without_desc * 5)

        # Rule 3: Owners assignment checks
        if not details.get("owner"):
            warnings.append("Security Warning: No designated dataset owner mapped inside GMS registries.")
            score -= 10

        return {
            "entity_name": name,
            "naming_review_score": max(0, score),
            "conformance_warnings": warnings,
            "review_status": "PASSED" if score >= 70 else "ACTION_REQUIRED"
        }

# Global single instance coordinator
review_auditor = EngineeringReviewAuditor()
