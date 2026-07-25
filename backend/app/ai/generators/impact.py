from typing import Dict, Any, List

class LineageImpactEngine:
    """Analyzes downstream asset dependency risks when columns/tables are modified."""

    def perform_impact_analysis(
        self,
        urn: str,
        target_column: str,
        downstream_nodes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        impacted_systems = []
        highest_risk = "LOW"

        for idx, node in enumerate(downstream_nodes):
            distance = idx + 1
            risk = "HIGH" if distance == 1 else "MEDIUM" if distance == 2 else "LOW"
            if risk == "HIGH" or (risk == "MEDIUM" and highest_risk != "HIGH"):
                highest_risk = risk

            impacted_systems.append({
                "urn": node["id"],
                "name": node["label"],
                "platform": node["type"],
                "distance": distance,
                "risk_rating": risk,
                "recommendation": f"Verify field references to '{target_column}' in staging prior to deploying downstream transformations."
            })

        return {
            "source_urn": urn,
            "target_column": target_column,
            "impact_risk_rating": highest_risk,
            "affected_systems_count": len(impacted_systems),
            "impacted_systems": impacted_systems
        }

# Global single instance coordinator
lineage_impact_engine = LineageImpactEngine()
