// Hằng số và biến cho token management
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";
const ADMIN_TOKEN_EXPIRES_AT_KEY = "englishup_admin_token_expires_at";
const REFRESH_BUFFER_SECONDS = 300;

let isRefreshing = false;
let refreshSubscribers = [];

// Đăng ký callback chờ refresh token xong
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Thông báo cho các request đang chờ khi token được refresh
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  saveAdminSession(data.data);
  return data;
};

// Hàm gửi request cho admin - dùng token key riêng, có xử lý refresh token
const fetchAdminWithAuth = async (url, options = {}) => {
  const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
    return data;
  };

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

    // Retry request với token mới
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

// Xử lý response chung
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

export {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_TOKEN_EXPIRES_AT_KEY,
  fetchAdminWithAuth,
  handleResponse,
  getTokenExpiresAt,
  isTokenExpiringSoon,
  saveAdminSession,
  clearAdminSession,
  refreshAdminToken,
};
