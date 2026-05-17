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
// Hỗ trợ cả array (format cũ) và object (format doc: { word, pronunciation, definition, example })
export const addWordsToVocabSet = async (id, wordData) => {
  let body;
  if (Array.isArray(wordData)) {
    // Format cũ: truyền array words
    body = { words: wordData };
  } else {
    // Format doc: truyền object { word, pronunciation, definition, example }
    body = { word: wordData.word, pronunciation: wordData.pronunciation, definition: wordData.definition, example: wordData.example };
  }
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// Xóa từ khỏi bộ từ vựng khi đang pending
// Backend dùng query param ?wordId= (theo doc)
export const removeWordsFromVocabSet = async (id, wordId) => {
  const params = new URLSearchParams({ wordId });
  return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words?${params}`, {
    method: "DELETE",
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
