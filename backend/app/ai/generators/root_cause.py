from typing import Dict, Any, List

class RootCauseDiagnosticsEngine:
    """Analyzes pipeline crash logs and missing fields dependencies, advising remediation actions."""

    def diagnose_failure(
        self,
        failed_pipeline: str,
        error_logs: str,
        affected_datasets: List[str]
    ) -> Dict[str, Any]:
        
        # Simple rule checks matching standard error triggers
        reasons = []
        fixes = []
        confidence = 0.90

        if "null" in error_logs.lower() or "not null" in error_logs.lower():
            reasons.append("Data Quality constraint violation: NULL values encountered in a NOT NULL column.")
            fixes.append("Filter null attributes or modify schema properties definitions to allow nullable values.")
        elif "column" in error_logs.lower() or "field" in error_logs.lower():
            reasons.append("Schema drift encounter: Upstream schema changes altered column mappings.")
            fixes.append("Verify matching columns are exported from source pipelines.")
        else:
            reasons.append("Unidentified network or connection fault in database storage driver.")
            fixes.append("Verify network accessibility settings between databases hosts.")
            confidence = 0.70

        return {
            "failed_pipeline": failed_pipeline,
            "detected_triggers": reasons,
            "remedial_actions": fixes,
            "confidence_score": confidence,
            "affected_downstream_datasets": affected_datasets
        }

# Global single instance coordinator
root_cause_engine = RootCauseDiagnosticsEngine()
