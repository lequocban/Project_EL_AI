const ADMIN_URL = "/api/v1/admin";
const ADMIN_AUTH_URL = "/api/v1/admin/auth";
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";

// Hàm gửi request cho admin - dùng token key riêng
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
    throw new Error("Chưa đăng nhập admin");
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token),
  });

  // Xử lý 401 - xóa token và chuyển về trang login
  if (res.status === 401) {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  return handleResponse(res);
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
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
    return handleResponse(res);
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

  // ============ MODERATION - CHỈNH SỬA KHI ĐANG PENDING ============

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

  // Xóa từ khỏi bộ từ vựng khi pending
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
  updateReadingQuestion: async (questionId, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/reading-questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
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
  updateListeningQuestion: async (questionId, data) => {
    return fetchAdminWithAuth(ADMIN_URL + `/moderation/listening-questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

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
};
