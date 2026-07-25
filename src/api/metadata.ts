import { apiClient } from "./client";

export interface DatahubEntity {
  urn: string;
  name: string;
  type: string;
  platform: string;
  description: string;
  owner?: string;
  tags?: string[];
  fields?: Array<{
    name: string;
    type: string;
    description: string;
    nullable: boolean;
  }>;
}

export interface LineageNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  description: string;
  owner: string;
  tags: string[];
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
}

export interface LineageGraphResponse {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export const metadataApi = {
  async getStatus() {
    const response = await apiClient.get("/metadata/status");
    return response.data;
  },

  async search(q: string, type = "dataset") {
    const response = await apiClient.get("/metadata/search", {
      params: { q, type },
    });
    return response.data;
  },

  async getEntity(urn: string): Promise<DatahubEntity> {
    const response = await apiClient.get(`/metadata/entities/${encodeURIComponent(urn)}`);
    return response.data;
  },

  async getDatasets(): Promise<DatahubEntity[]> {
    const response = await apiClient.get("/metadata/datasets");
    return response.data;
  },

  async getPipelines() {
    const response = await apiClient.get("/metadata/pipelines");
    return response.data;
  },

  async getDashboards() {
    const response = await apiClient.get("/metadata/dashboards");
    return response.data;
  },

  async getSchema(urn: string) {
    const response = await apiClient.get("/metadata/schema", {
      params: { urn },
    });
    return response.data;
  },

  async getLineage(urn: string): Promise<LineageGraphResponse> {
    const response = await apiClient.get("/metadata/lineage", {
      params: { urn },
    });
    return response.data;
  },

  async getContext(urn: string) {
    const response = await apiClient.get("/metadata/context", {
      params: { urn },
    });
    return response.data;
  },
};
