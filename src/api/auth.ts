import { apiClient } from "./client";

export const authApi = {
  async register(data: any) {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  async login(data: any) {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  async logout(refreshToken: string) {
    const response = await apiClient.post("/auth/logout", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
