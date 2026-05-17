import { fetchAdminWithAuth } from "./auth";

// Lấy danh sách bài luyện nghe chờ duyệt
export const getListeningPending = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth("/api/v1/admin/listening-lessons/pending?" + params, { method: "GET" });
};

// Duyệt bài luyện nghe
export const approveListening = async (id) => {
  return fetchAdminWithAuth("/api/v1/admin/listening-lessons/" + id + "/approve", { method: "POST" });
};

// Từ chối bài luyện nghe
export const rejectListening = async (id) => {
  return fetchAdminWithAuth("/api/v1/admin/listening-lessons/" + id + "/reject", { method: "POST" });
};

// Lấy tất cả bài luyện nghe (không phân biệt người tạo)
export const getAllListeningLessons = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth("/api/v1/listening-lessons/public?" + params, { method: "GET" });
};

// Lấy bài luyện nghe theo ID
export const getListeningLessonById = async (id) => {
  return fetchAdminWithAuth("/api/v1/listening-lessons/" + id, { method: "GET" });
};

// Tạo bài luyện nghe mới
export const createListeningLesson = async ({ title, audioUrl, transcript, viTranslation }) => {
  return fetchAdminWithAuth("/api/v1/listening-lessons", {
    method: "POST",
    body: JSON.stringify({ title, audioUrl, transcript, viTranslation }),
  });
};

// Xóa bài luyện nghe
export const deleteListeningLesson = async (id) => {
  return fetchAdminWithAuth("/api/v1/listening-lessons/" + id, { method: "DELETE" });
};
