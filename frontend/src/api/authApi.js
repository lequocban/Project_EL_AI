import { appParams } from "@/lib/app-params";

// Dùng relative path để Vite proxy bắt request, fallback về absolute URL khi build
const API_BASE_URL = import.meta.env.VITE_BASE_URL || appParams.appBaseUrl || "";
const AUTH_URL = `${API_BASE_URL}/api/v1/auth`;
const PROFILE_URL = `${API_BASE_URL}/api/v1/profile`;
const ACCESS_TOKEN_KEY = "englishup_access_token";

// Xử lý response từ API
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

// Lưu session vào localStorage
const saveSession = (session) => {
  if (!session?.accessToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
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

// Làm mới access token
const requestRefreshToken = async () => {
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

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token),
  });

  // Tự động refresh token khi bị 401
  if (res.status === 401) {
    try {
      const refreshData = await requestRefreshToken();
      res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: buildHeaders(refreshData.data?.accessToken),
      });
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
  }

  return handleResponse(res);
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
      body: JSON.stringify({ userName, dayOfBirth }),
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

export { API_BASE_URL };
