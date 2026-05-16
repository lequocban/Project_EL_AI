import { fetchAdminWithAuth, handleResponse, saveAdminSession } from "./auth";

const ADMIN_AUTH_URL = "/api/v1/admin/auth";

export const authApi = {
  // Đăng nhập admin
  login: async (email, password) => {
    const res = await fetch(ADMIN_AUTH_URL + "/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    saveAdminSession(data.data);
    return data;
  },

  // Lấy thông tin admin hiện tại
  getMe: async () => {
    return fetchAdminWithAuth(ADMIN_AUTH_URL + "/me", { method: "GET" });
  },

  // Đăng xuất
  logout: async () => {
    return fetchAdminWithAuth(ADMIN_AUTH_URL + "/logout", { method: "POST" });
  },
};
