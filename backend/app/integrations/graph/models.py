from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EntityReference(BaseModel):
    urn: str
    name: str
    type: str  # dataset, pipeline, dashboard, user

class Node(BaseModel):
    id: str = Field(..., description="Unique Urn key representing entity.")
    name: str
    type: str  # dataset, pipeline, dashboard
    platform: str  # snowflake, postgres, s3, etc.
    description: Optional[str] = None
    owner: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    domain: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class Edge(BaseModel):
    source: str = Field(..., description="Source node id/URN.")
    target: str = Field(..., description="Target node id/URN.")
    relationship_type: str = "downstream"  # downstream, upstream, calls, modifies
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphPath(BaseModel):
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)

class MetadataSnapshot(BaseModel):
    urn: str
    timestamp: float
    snapshot: Dict[str, Any]
