import { fetchAdminWithAuth } from "./auth";

const ADMIN_URL = "/api/v1/admin";

export const usersApi = {
  // Lấy danh sách người dùng
  getUsers: async ({ page = 1, limit = 20, search = "", sortField = "created_at", sortOrder = "desc", status = "", role = "" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append("search", search);
    if (sortField) params.append("sortField", sortField);
    if (sortOrder) params.append("sortOrder", sortOrder);
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    return fetchAdminWithAuth(ADMIN_URL + `/users?${params}`, { method: "GET" });
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (userId) => {
    return fetchAdminWithAuth(ADMIN_URL + `/users/${userId}`, { method: "GET" });
  },

  // Cập nhật trạng thái người dùng (khóa/mở khóa)
  updateUserStatus: async (userIds, status) => {
    return fetchAdminWithAuth(ADMIN_URL + "/users/status", {
      method: "PATCH",
      body: JSON.stringify({ userIds, status }),
    });
  },

  // Cấp hoặc thu hồi vai trò
  updateUserRole: async (userId, role, action) => {
    return fetchAdminWithAuth(ADMIN_URL + "/users/roles", {
      method: "PATCH",
      body: JSON.stringify({ userId, role, action }),
    });
  },

  // Xóa tài khoản người dùng (chỉ xóa được khi inactive)
  deleteUser: async (userId) => {
    return fetchAdminWithAuth(ADMIN_URL + `/users/${userId}`, { method: "DELETE" });
  },
};
