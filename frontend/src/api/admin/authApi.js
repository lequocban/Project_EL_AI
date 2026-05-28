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

  // Cập nhật hồ sơ cá nhân (gọi endpoint profile/me)
  updateProfile: async ({ userName, dayOfBirth }) => {
    const res = await fetch("/api/v1/profile/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("englishup_admin_token")}`,
      },
      body: JSON.stringify({ userName, dayOfBirth }),
    });
    return handleResponse(res);
  },

  // Đổi mật khẩu (gọi endpoint profile/change-password)
  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch("/api/v1/profile/change-password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("englishup_admin_token")}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },
};
