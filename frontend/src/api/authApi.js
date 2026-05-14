import { appParams } from "@/lib/app-params";

// Dùng relative path để Vite proxy bắt request, fallback về absolute URL khi build
const API_BASE_URL = import.meta.env.VITE_BASE_URL || appParams.appBaseUrl || "";
const AUTH_URL = `${API_BASE_URL}/api/v1/auth`;
const PROFILE_URL = `${API_BASE_URL}/api/v1/profile`;
const ACCESS_TOKEN_KEY = "englishup_access_token";
const TOKEN_EXPIRES_AT_KEY = "englishup_token_expires_at";

// Thời gian buffer (giây) trước khi token hết hạn thì tự động refresh
// Refresh sớm 5 phút để tránh race condition
const REFRESH_BUFFER_SECONDS = 300;

let isRefreshing = false;
let refreshSubscribers = [];

// Hàm đăng ký callback chờ refresh xong
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Hàm thông báo cho tất cả các request đang chờ khi refresh xong
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Xử lý response từ API
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

// Lấy expiresAt từ localStorage
const getTokenExpiresAt = () => {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  return expiresAt ? parseInt(expiresAt, 10) : null;
};

// Kiểm tra token có sắp hết hạn chưa (còn REFRESH_BUFFER_SECONDS nữa là refresh)
const isTokenExpiringSoon = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return true; // Không có expiresAt thì coi như sắp hết hạn
  const now = Date.now();
  const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
  // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
  return expiresAt * 1000 - bufferMs < now;
};

// Kiểm tra token đã hết hạn chưa
const isTokenExpired = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return true;
  // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
  return expiresAt * 1000 < Date.now();
};

// Lưu session vào localStorage (access token + expiresAt)
const saveSession = (session) => {
  if (!session?.accessToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  if (session.expiresAt) {
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(session.expiresAt));
  }
};

// Xóa token khỏi localStorage
const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
};

// Gửi request POST với JSON body
const postJson = async (url, body, options = {}) => {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

// Gửi request có tự động thêm Authorization header và xử lý refresh token
export const fetchWithAuth = async (url, options = {}) => {
  const buildHeaders = (token) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // Lấy token từ localStorage
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token),
  });

  // Tự động refresh token khi bị 401 hoặc token sắp hết hạn
  if (res.status === 401 || isTokenExpiringSoon()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Gọi refresh token
        const refreshRes = await fetch(`${AUTH_URL}/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!refreshRes.ok) {
          // Refresh thất bại - token không hợp lệ hoặc đã hết hạn
          clearSession();
          window.location.href = "/login";
          throw new Error("Unauthorized");
        }

        const refreshData = await handleResponse(refreshRes);
        saveSession(refreshData.data);
        onTokenRefreshed(refreshData.data?.accessToken);
        isRefreshing = false;
      } catch (err) {
        isRefreshing = false;
        clearSession();
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
    } else {
      // Đang có request refresh đang chạy - chờ nó xong
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

    // Retry request với token mới (chỉ khi chưa được xử lý bởi subscriber)
    if (isTokenExpired()) {
      throw new Error("Unauthorized");
    }
    const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: buildHeaders(newToken),
    });
  }

  return handleResponse(res);
};

// Refresh token thủ công (dùng bởi AuthContext khi khởi động)
export const requestRefreshToken = async () => {
  const res = await fetch(`${AUTH_URL}/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await handleResponse(res);
  saveSession(data.data);
  return data;
};

export const authApi = {
  // Đăng nhập
  login: async (email, password) => {
    const data = await postJson(`${AUTH_URL}/login`, { email, password });
    saveSession(data.data);
    return data;
  },

  // Đăng ký tài khoản mới
  register: async (email, password, userName) => {
    const data = await postJson(`${AUTH_URL}/register`, {
      email,
      password,
      userName,
    });
    saveSession(data.data);
    return data;
  },

  // Lấy thông tin user hiện tại
  me: async () => {
    return fetchWithAuth(`${PROFILE_URL}/me`, { method: "GET" });
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async ({ userName, dayOfBirth }) => {
    return fetchWithAuth(`${PROFILE_URL}/me`, {
      method: "PATCH",
      body: JSON.stringify({
        userName,
        dayOfBirth,
        updated_at: new Date().toISOString(),
      }),
    });
  },

  // Yêu cầu gửi mã OTP qua email
  requestOtp: (email) => postJson(`${AUTH_URL}/request-otp`, { email }),

  // Đặt lại mật khẩu bằng OTP
  resetPassword: (email, otp, newPassword) =>
    postJson(`${AUTH_URL}/reset-password`, { email, otp, newPassword }),

  // Làm mới access token
  refreshToken: requestRefreshToken,

  // Đổi mật khẩu
  changePassword: (currentPassword, newPassword) =>
    fetchWithAuth(`${AUTH_URL}/change-password`, {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Đăng xuất
  logout: async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      await fetch(`${AUTH_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {});
    }
    clearSession();
  },
};

export { API_BASE_URL };
