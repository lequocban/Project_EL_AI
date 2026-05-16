const ADMIN_URL = "/api/v1/admin";
const ADMIN_AUTH_URL = "/api/v1/admin/auth";
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";
const ADMIN_TOKEN_EXPIRES_AT_KEY = "englishup_admin_token_expires_at";
const REFRESH_BUFFER_SECONDS = 300;

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

// Lấy expiresAt từ localStorage
const getTokenExpiresAt = () => {
  const expiresAt = localStorage.getItem(ADMIN_TOKEN_EXPIRES_AT_KEY);
  return expiresAt ? parseInt(expiresAt, 10) : null;
};

// Kiểm tra token có sắp hết hạn không
const isTokenExpiringSoon = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;
  const now = Date.now();
  const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
  // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
  return expiresAt * 1000 - bufferMs < now;
};

// Lưu session admin vào localStorage (access token + expiresAt)
const saveAdminSession = (session) => {
  if (!session?.accessToken) return;
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, session.accessToken);
  if (session.expiresAt) {
    localStorage.setItem(ADMIN_TOKEN_EXPIRES_AT_KEY, String(session.expiresAt));
  }
};

// Xóa session admin
const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRES_AT_KEY);
};

// Refresh token cho admin (dùng chung endpoint refresh-token)
const refreshAdminToken = async () => {
  const res = await fetch("/api/v1/auth/refresh-token", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    clearAdminSession();
    window.location.href = "/admin/login";
    throw new Error("Refresh token failed");
  }
  const data = await handleResponse(res);
  saveAdminSession(data.data);
  return data;
};

// Hàm gửi request cho admin - dùng token key riêng, có xử lý refresh token
const fetchAdminWithAuth = async (url, options = {}) => {
  const buildHeaders = (token) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const token = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  if (!token) {
    window.location.href = "/admin/login";
    throw new Error("Chưa đăng nhập admin");
  }

  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token),
  });

  // Xử lý 401 hoặc token sắp hết hạn - refresh token
  if (res.status === 401 || isTokenExpiringSoon()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshAdminToken();
        onTokenRefreshed(localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY));
        isRefreshing = false;
      } catch (err) {
        isRefreshing = false;
        clearAdminSession();
        window.location.href = "/admin/login";
        throw new Error("Unauthorized");
      }
    } else {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          fetch(url, {
            ...options,
            credentials: "include",
            headers: buildHeaders(newToken),
          })
            .then(handleResponse)
            .then(resolve)
            .catch(reject);
        });
      });
    }

    // Retry request với token mới - return ngay kết quả retry
    const newToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    const retryRes = await fetch(url, {
      ...options,
      credentials: "include",
      headers: buildHeaders(newToken),
    });
    return handleResponse(retryRes);
  }

  return handleResponse(res);
};

export const adminApi = {
  // Đăng nhập admin
  login: async (email, password) => {
    const res = await fetch(ADMIN_AUTH_URL + "/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    // Lưu session với expiresAt
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

  // Lấy thống kê hệ thống (chỉ admin)
  getStats: async () => {
    return fetchAdminWithAuth(ADMIN_URL + "/stats", { method: "GET" });
  },

  // ============ QUẢN LÝ NGƯỜI DÙNG (chỉ admin) ============

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

  // ============ QUẢN LÝ BỘ TỪ VỰNG ============

  // Lấy danh sách bộ từ vựng chờ duyệt
  getVocabPending: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/pending?${params}`, { method: "GET" });
  },

  // Duyệt bộ từ vựng
  approveVocabSet: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/${id}/approve`, { method: "POST" });
  },

  // Từ chối bộ từ vựng
  rejectVocabSet: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/vocabulary-sets/${id}/reject`, { method: "POST" });
  },

  // ============ QUẢN LÝ BÀI LUYỆN ĐỌC ============

  getReadingPending: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth(ADMIN_URL + `/reading-lessons/pending?${params}`, { method: "GET" });
  },

  approveReading: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/reading-lessons/${id}/approve`, { method: "POST" });
  },

  rejectReading: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/reading-lessons/${id}/reject`, { method: "POST" });
  },

  // ============ QUẢN LÝ BÀI LUYỆN NGHE ============

  getListeningPending: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth(ADMIN_URL + `/listening-lessons/pending?${params}`, { method: "GET" });
  },

  approveListening: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/listening-lessons/${id}/approve`, { method: "POST" });
  },

  rejectListening: async (id) => {
    return fetchAdminWithAuth(ADMIN_URL + `/listening-lessons/${id}/reject`, { method: "POST" });
  },

  // ============ MODERATION - KIỂM DUYỆT NỘI DUNG ============

  // Lấy chi tiết yêu cầu kiểm duyệt
  getModerationRequest: async (requestId) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/requests/${requestId}`, { method: "GET" });
  },

  // Phê duyệt hoặc từ chối yêu cầu kiểm duyệt
  reviewModerationRequest: async (requestId, action, reason, notes) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/requests/${requestId}/review`, {
      method: "POST",
      body: JSON.stringify({ action, reason, notes }),
    });
  },

  // Chỉnh sửa bộ từ vựng khi đang pending
  updateVocabSet: async (id, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Thêm từ vào bộ từ vựng khi pending
  addWordsToVocabSet: async (id, words) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words`, {
      method: "POST",
      body: JSON.stringify({ words }),
    });
  },

  // Xóa từ khỏi bộ từ vựng khi pending (backend nhận { wordIds: [id1, id2] })
  removeWordsFromVocabSet: async (id, wordIds) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/vocabulary-sets/${id}/words`, {
      method: "DELETE",
      body: JSON.stringify({ wordIds }),
    });
  },

  // Chỉnh sửa bài luyện đọc khi pending
  updateReadingLesson: async (id, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Chỉnh sửa câu hỏi đọc hiểu khi bài pending
  // Body cần: lessonId (ID bài đọc), question, option_a, option_b, option_c, option_d, correct_answer, explain
  updateReadingQuestion: async (questionId, lessonId, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify({ lessonId, ...data }),
    });
  },

  // Chỉnh sửa bài luyện nghe khi pending
  updateListeningLesson: async (id, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Chỉnh sửa câu hỏi nghe hiểu khi bài pending
  // Body cần: lessonId (ID bài nghe), question, option_a, option_b, option_c, option_d, correct_answer, explain
  updateListeningQuestion: async (questionId, lessonId, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify({ lessonId, ...data }),
    });
  },

  // Lấy danh sách yêu cầu kiểm duyệt bộ từ vựng
  getModerationVocabularySets: async ({
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
  },

  // Lấy danh sách yêu cầu kiểm duyệt bài luyện đọc
  getModerationReadingLessons: async ({
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
  },

  // Lấy danh sách yêu cầu kiểm duyệt bài luyện nghe
  getModerationListeningLessons: async ({
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
  },

  // ============ DỮ LIỆU CỘNG (cho CRUD) ============

  createVocabSet: async ({ title, description }) => {
    return fetchAdminWithAuth("/api/v1/vocabulary-sets", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },

  createReadingLesson: async ({ title, content, viTranslation }) => {
    return fetchAdminWithAuth("/api/v1/reading-lessons", {
      method: "POST",
      body: JSON.stringify({ title, content, vi_translation: viTranslation }),
    });
  },

  createListeningLesson: async ({ title, audioUrl, transcript, viTranslation }) => {
    return fetchAdminWithAuth("/api/v1/listening-lessons", {
      method: "POST",
      body: JSON.stringify({ title, audioUrl, transcript, viTranslation }),
    });
  },

  deleteVocabSet: async (id) => {
    return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + id, { method: "DELETE" });
  },

  deleteReadingLesson: async (id) => {
    return fetchAdminWithAuth("/api/v1/reading-lessons/" + id, { method: "DELETE" });
  },

  deleteListeningLesson: async (id) => {
    return fetchAdminWithAuth("/api/v1/listening-lessons/" + id, { method: "DELETE" });
  },

  getVocabSetById: async (id) => {
    return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + id, { method: "GET" });
  },

  getReadingLessonById: async (id) => {
    return fetchAdminWithAuth("/api/v1/reading-lessons/" + id, { method: "GET" });
  },

  getListeningLessonById: async (id) => {
    return fetchAdminWithAuth("/api/v1/listening-lessons/" + id, { method: "GET" });
  },

  getVocabSetWords: async (setId, { page = 1, limit = 15 } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return fetchAdminWithAuth("/api/v1/vocabulary-sets/" + setId + "/words?" + params, { method: "GET" });
  },

  // ============ LẤY TẤT CẢ (CHO TAB "TẤT CẢ") ============

  // Lấy tất cả bộ từ vựng (không phân biệt người tạo)
  getAllVocabularySets: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth("/api/v1/vocabulary-sets/public?" + params, { method: "GET" });
  },

  // Lấy tất cả bài luyện đọc (không phân biệt người tạo)
  getAllReadingLessons: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth("/api/v1/reading-lessons/public?" + params, { method: "GET" });
  },

  // Lấy tất cả bài luyện nghe (không phân biệt người tạo)
  getAllListeningLessons: async ({ page = 1, limit = 15, keyword = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (keyword) params.append("keyword", keyword);
    return fetchAdminWithAuth("/api/v1/listening-lessons/public?" + params, { method: "GET" });
  },
};

// Export các hàm để AdminAuthContext có thể dùng
export { refreshAdminToken, clearAdminSession, getTokenExpiresAt };
