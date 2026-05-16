import { fetchAdminWithAuth } from "./auth";

const ADMIN_URL = "/api/v1/admin";

// Lấy thống kê hệ thống (chỉ admin)
export const getStats = async () => {
  return fetchAdminWithAuth(ADMIN_URL + "/stats", { method: "GET" });
};
