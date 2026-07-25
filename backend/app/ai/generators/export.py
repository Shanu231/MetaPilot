import io
import zipfile
from typing import Dict

class ZIPArtifactExporter:
    """Packages generated code files and YAML configurations into download-ready ZIP files."""

    def build_zip_package(self, files: Dict[str, str]) -> bytes:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for filename, content in files.items():
                zip_file.writestr(filename, content)
        
        # Rewind pointer to beginning
        zip_buffer.seek(0)
        return zip_buffer.getvalue()

# Global single instance coordinator
zip_exporter = ZIPArtifactExporter()
