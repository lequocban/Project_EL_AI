import { fetchAdminWithAuth } from "./auth";

const ADMIN_URL = "/api/v1/admin";

// Lấy chi tiết yêu cầu kiểm duyệt
export const getModerationRequest = async (requestId) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/requests/${requestId}`, { method: "GET" });
};

// Phê duyệt hoặc từ chối yêu cầu kiểm duyệt
export const reviewModerationRequest = async (requestId, action, reason, notes) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/requests/${requestId}/review`, {
    method: "POST",
    body: JSON.stringify({ action, reason, notes }),
  });
};

// Chỉnh sửa bộ từ vựng khi đang pending
export const updateVocabSet = async (id, data) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// Thêm từ vào bộ từ vựng khi pending
export const addWordsToVocabSet = async (id, words) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words`, {
    method: "POST",
    body: JSON.stringify({ words }),
  });
};

// Xóa từ khỏi bộ từ vựng khi pending
export const removeWordsFromVocabSet = async (id, wordIds) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words`, {
    method: "DELETE",
    body: JSON.stringify({ wordIds }),
  });
};

// Chỉnh sửa bài luyện đọc khi pending
export const updateReadingLesson = async (id, data) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// Chỉnh sửa câu hỏi đọc hiểu khi bài pending
export const updateReadingQuestion = async (questionId, lessonId, data) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify({ lessonId, ...data }),
  });
};

// Chỉnh sửa bài luyện nghe khi pending
export const updateListeningLesson = async (id, data) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// Chỉnh sửa câu hỏi nghe hiểu khi bài pending
export const updateListeningQuestion = async (questionId, lessonId, data) => {
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify({ lessonId, ...data }),
  });
};

// Lấy danh sách yêu cầu kiểm duyệt bộ từ vựng
export const getModerationVocabularySets = async ({
  page = 1, limit = 15, sortField = "created_at", sortOrder = "desc", status = ""
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortField,
    sortOrder,
  });
  if (status) params.append("status", status);
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets?${params}`, { method: "GET" });
};

// Lấy danh sách yêu cầu kiểm duyệt bài luyện đọc
export const getModerationReadingLessons = async ({
  page = 1, limit = 15, sortField = "created_at", sortOrder = "desc", status = ""
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortField,
    sortOrder,
  });
  if (status) params.append("status", status);
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-lessons?${params}`, { method: "GET" });
};

// Lấy danh sách yêu cầu kiểm duyệt bài luyện nghe
export const getModerationListeningLessons = async ({
  page = 1, limit = 15, sortField = "created_at", sortOrder = "desc", status = ""
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortField,
    sortOrder,
  });
  if (status) params.append("status", status);
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-lessons?${params}`, { method: "GET" });
};
