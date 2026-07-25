from typing import Dict, Any

class AirflowDAGGenerator:
    """Generates runnable Apache Airflow Python DAG code scripts."""

    def generate_taskflow_dag(
        self,
        dag_id: str,
        schedule_interval: str,
        tasks_list: list
    ) -> str:
        tasks_defs = []
        for task in tasks_list:
            tasks_defs.append(f"""    @task()
    def {task}():
        # Executes tasks pipeline actions
        print("Executing task: {task}")
        return "{task}_success"
""")
        
        tasks_calls = " >> ".join(f"{t}()" for t in tasks_list)
        tasks_str = "\n".join(tasks_defs)

        dag_code = f"""import datetime
from airflow.decorators import dag, task

default_args = {{
    'owner': 'MetaPilot Data Platform Team',
    'retries': 2,
    'retry_delay': datetime.timedelta(minutes=5),
}}

@dag(
    dag_id='{dag_id}',
    default_args=default_args,
    schedule_interval='{schedule_interval}',
    start_date=datetime.datetime(2026, 1, 1),
    catchup=False,
    tags=['metapilot', 'automation'],
)
def {dag_id}_orchestration():
{tasks_str}
    # Define execution order
    {tasks_calls}

dag_run = {dag_id}_orchestration()
"""
        return dag_code

# Global single instance coordinator
airflow_generator = AirflowDAGGenerator()
