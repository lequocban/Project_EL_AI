import { fetchAdminWithAuth } from "./auth";

// Lấy danh sách bài luyện đọc chờ duyệt
export const getReadingPending = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth("/api/v1/admin/reading-lessons/pending?" + params, { method: "GET" });
};

// Duyệt bài luyện đọc
export const approveReading = async (id) => {
  return fetchAdminWithAuth("/api/v1/admin/reading-lessons/" + id + "/approve", { method: "POST" });
};

// Từ chối bài luyện đọc
export const rejectReading = async (id) => {
  return fetchAdminWithAuth("/api/v1/admin/reading-lessons/" + id + "/reject", { method: "POST" });
};

// Lấy tất cả bài luyện đọc (không phân biệt người tạo)
export const getAllReadingLessons = async ({ page = 1, limit = 15, keyword = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append("keyword", keyword);
  return fetchAdminWithAuth("/api/v1/reading-lessons/public?" + params, { method: "GET" });
};

// Lấy bài luyện đọc theo ID
export const getReadingLessonById = async (id) => {
  return fetchAdminWithAuth("/api/v1/reading-lessons/" + id, { method: "GET" });
};

// Tạo bài luyện đọc mới
export const createReadingLesson = async ({ title, content, viTranslation }) => {
  return fetchAdminWithAuth("/api/v1/reading-lessons", {
    method: "POST",
    body: JSON.stringify({ title, content, vi_translation: viTranslation }),
  });
};

// Xóa bài luyện đọc
export const deleteReadingLesson = async (id) => {
  return fetchAdminWithAuth("/api/v1/reading-lessons/" + id, { method: "DELETE" });
};
