import { apiClient } from "./client";

export const userApi = {
  async getProfile() {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  async changePassword(data: any) {
    const response = await apiClient.post("/users/me/password", data);
    return response.data;
  },

  async getWorkspace() {
    const response = await apiClient.get("/users/me/workspace");
    return response.data;
  },

  async updateWorkspace(settings: any) {
    const response = await apiClient.put("/users/me/workspace", { settings });
    return response.data;
  },

  async getNotifications() {
    const response = await apiClient.get("/users/me/notifications");
    return response.data;
  },

  async markNotificationRead(id: string, isRead: boolean) {
    const response = await apiClient.put(`/users/me/notifications/${id}`, {
      is_read: isRead,
    });
    return response.data;
  },
};
