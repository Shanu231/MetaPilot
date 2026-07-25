import { apiClient } from "./client";

export const systemApi = {
  async getHealth() {
    const response = await apiClient.get("/system/health");
    return response.data;
  },

  async getReadiness() {
    const response = await apiClient.get("/system/readiness");
    return response.data;
  },

  async getVersion() {
    const response = await apiClient.get("/system/version");
    return response.data;
  },
};
