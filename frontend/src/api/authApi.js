import { appParams } from "@/lib/app-params";

const API_BASE_URL = appParams.appBaseUrl || "http://localhost:3000";
const AUTH_URL = `${API_BASE_URL}/api/v1/auth`;
const PROFILE_URL = `${API_BASE_URL}/api/v1/profile`;
const ACCESS_TOKEN_KEY = "base44_access_token";
const REFRESH_TOKEN_KEY = "base44_refresh_token";

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

const saveSession = (session) => {
  if (!session) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
};

const postJson = async (url, body, options = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return handleResponse(res);
};

export const authApi = {
  login: async (email, password) => {
    const data = await postJson(`${AUTH_URL}/login`, { email, password });
    saveSession(data.data);
    return data;
  },

  register: async (email, password, userName) => {
    const data = await postJson(`${AUTH_URL}/register`, {
      email,
      password,
      userName,
    });
    saveSession(data.data);
    return data;
  },

  me: async () => {
    return fetchWithAuth(`${PROFILE_URL}/me`, { method: "GET" });
  },

  updateProfile: async ({ userName, dayOfBirth }) => {
    return fetchWithAuth(`${PROFILE_URL}/me`, {
      method: "PATCH",
      body: JSON.stringify({ userName, dayOfBirth }),
    });
  },

  requestOtp: (email) => postJson(`${AUTH_URL}/request-otp`, { email }),

  resetPassword: (email, otp, newPassword) =>
    postJson(`${AUTH_URL}/reset-password`, { email, otp, newPassword }),

  changePassword: (currentPassword, newPassword) =>
    fetchWithAuth(`${AUTH_URL}/change-password`, {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      await fetch(`${AUTH_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {});
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export { API_BASE_URL };
