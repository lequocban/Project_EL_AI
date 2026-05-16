import { fetchAdminWithAuth } from "./auth";

const ADMIN_URL = "/api/v1/admin";

// Lấy danh sách bộ từ vựng chờ duyệt
export const getVocabPending = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/pending?${params}`, { method: "GET" });
};

// Duyệt bộ từ vựng
export const approveVocabSet = async (id) => {
  return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/${id}/approve`, { method: "POST" });
};

// Từ chối bộ từ vựng
export const rejectVocabSet = async (id) => {
  return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/${id}/reject`, { method: "POST" });
};

// Lấy tất cả bộ từ vựng (không phân biệt người tạo)
export const getAllVocabularySets = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth("/api/v1/vocabulary-sets/public?" + params, { method: "GET" });
};

// Lấy bộ từ vựng theo ID
export const getVocabSetById = async (id) => {
  return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + id, { method: "GET" });
};

// Tạo bộ từ vựng mới
export const createVocabSet = async ({ title, description }) => {
  return fetchAdminWithAuth("/api/v1/vocabulary-sets", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
};

// Xóa bộ từ vựng
export const deleteVocabSet = async (id) => {
  return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + id, { method: "DELETE" });
};

// Lấy từ trong bộ từ vựng
export const getVocabSetWords = async (setId, { page = 1, limit = 15 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + setId + "/words?" + params, { method: "GET" });
};
