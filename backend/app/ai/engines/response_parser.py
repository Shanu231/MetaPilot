import re
from typing import Dict, Any, List, Optional

class ResponseParser:
    """Parses text logs and extracts code files configurations from LLM streams."""

    def extract_code_blocks(self, text: str) -> Dict[str, str]:
        files = {}
        # Regex finding blocks like: ```sql ... ```
        pattern = r"```(sql|yaml|yml|python|py|bash|sh)?\n([\s\S]*?)```"
        matches = re.findall(pattern, text)
        
        for idx, (lang, content) in enumerate(matches):
            ext = "sql"
            if lang in ["yaml", "yml"]:
                ext = "yml"
            elif lang in ["python", "py"]:
                ext = "py"
            elif lang in ["bash", "sh"]:
                ext = "sh"

            filename = f"artifact_{idx + 1}.{ext}"
            files[filename] = content.strip()
        
        return files

    def extract_json_payload(self, text: str) -> Optional[Dict[str, Any]]:
        pattern = r"```json\n([\s\S]*?)```"
        match = re.search(pattern, text)
        if match:
            try:
                import json
                return json.loads(match.group(1).strip())
            except Exception:
                pass
        return None

# Global single instance coordinator
response_parser = ResponseParser()
