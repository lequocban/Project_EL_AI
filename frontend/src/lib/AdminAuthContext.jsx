import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { adminApi, refreshAdminToken, clearAdminSession, getTokenExpiresAt, consumeAdminRedirect } from "@/api/admin";

const AdminAuthContext = createContext();
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";
const ADMIN_TOKEN_EXPIRES_AT_KEY = "englishup_admin_token_expires_at";
const ADMIN_ROLES_KEY = "englishup_admin_roles";

export { ADMIN_ACCESS_TOKEN_KEY, ADMIN_TOKEN_EXPIRES_AT_KEY, ADMIN_ROLES_KEY };
const REFRESH_BUFFER_SECONDS = 300;

// Provider xác thực admin với tự động refresh token
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshIntervalRef = useRef(null);

  // Tính thời gian (ms) đến lúc cần refresh token
  const getMsUntilRefresh = () => {
    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return null;
    const now = Date.now();
    const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
    // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
    return Math.max(0, expiresAt * 1000 - bufferMs - now);
  };

  // Kiểm tra token sắp hết hạn dựa vào buffer
  const isTokenExpiringSoon = () => {
    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return false;
    const now = Date.now();
    const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
    // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
    return expiresAt * 1000 - bufferMs < now;
  };

  // Thiết lập interval tự động refresh token
  const setupProactiveRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      if (typeof refreshIntervalRef.current === "number") {
        clearTimeout(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = null;
    }

    const msUntilRefresh = getMsUntilRefresh();
    if (msUntilRefresh === null) return;

    const startDelay = Math.min(msUntilRefresh, 60 * 1000);

    const timeoutId = setTimeout(() => {
      refreshIntervalRef.current = setInterval(async () => {
        if (isTokenExpiringSoon()) {
          try {
            await refreshAdminToken();
          } catch {
            // Refresh thất bại - sẽ được xử lý bởi fetchAdminWithAuth
          }
        }
      }, 60 * 1000);
    }, startDelay);

    refreshIntervalRef.current = timeoutId;
  };

  useEffect(() => {
    checkAdminAuth();

    return () => {
      // Chỉ clear interval, KHÔNG clearTimeout vì setTimeout được gán vào cùng ref
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiểm tra và khôi phục phiên đăng nhập admin khi khởi động
  const checkAdminAuth = async () => {
    // Xóa redirect flag từ lần trước (nếu có)
    const hadPendingRedirect = consumeAdminRedirect();

    try {
      setIsLoading(true);
      const token = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
      if (!token) {
        setAdmin(null);
        setIsAuthenticated(false);
        return;
      }
      // Backend sẽ validate role bằng requireManagerOrAdmin
      const response = await adminApi.getMe();
      // Endpoint getMe trả về user trực tiếp trong response.data (không có nested user)
      const user = response.data;
      const roles = (user?.roles || []).map(Number);

      // Lấy thêm họ và tên từ profile API
      let fullName = user?.userName || user?.username;
      try {
        const profileRes = await adminApi.getProfileMe();
        if (profileRes?.data?.userName) {
          fullName = profileRes.data.userName;
        }
      } catch {
        // fallback: dùng username đã có
      }

      setAdmin({
        ...user,
        user: {
          ...user,
          roles,
        },
        full_name: fullName,
      });
      localStorage.setItem(ADMIN_ROLES_KEY, JSON.stringify(roles));
      setIsAuthenticated(true);
      setError("");

      // Thiết lập proactive refresh
      setupProactiveRefresh();
    } catch (err) {
      clearAdminSession();
      setAdmin(null);
      setIsAuthenticated(false);
      // Nếu có lỗi từ fetchAdminWithAuth (token hết hạn, unauthorized),
      // chuyển hướng sau khi state đã settle
      if (hadPendingRedirect || err.shouldRedirect) {
        window.location.href = "/admin/login";
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng nhập admin và lưu session
  const login = async (email, password) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminApi.login(email, password);
      const loginUser = response.data?.user;
      if (response.data?.accessToken) {
        localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, response.data.accessToken);
        if (response.data.expiresAt) {
          localStorage.setItem(ADMIN_TOKEN_EXPIRES_AT_KEY, String(response.data.expiresAt));
        }
      }
      const roles = (loginUser?.roles || []).map(Number);
      // Lưu roles vào localStorage ĐỒNG BỘ để AdminProtectedRoute/AdminLayout đọc được ngay
      localStorage.setItem(ADMIN_ROLES_KEY, JSON.stringify(roles));

      // Lấy thêm họ và tên từ profile API
      let fullName = loginUser?.userName || loginUser?.username;
      try {
        const profileRes = await adminApi.getProfileMe();
        if (profileRes?.data?.userName) {
          fullName = profileRes.data.userName;
        }
      } catch {
        // fallback
      }

      setAdmin({
        ...loginUser,
        user: {
          ...loginUser,
          roles,
        },
        full_name: fullName,
      });
      setIsAuthenticated(true);
      setError("");
      setupProactiveRefresh();
      return response;
    } catch (err) {
      clearAdminSession();
      setAdmin(null);
      setIsAuthenticated(false);
      const msg = err.message || "Đăng nhập thất bại";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất admin và xóa session
  const logout = async () => {
    // Dừng interval/timeout refresh
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    try {
      await adminApi.logout();
    } catch {
      // Bỏ qua lỗi khi logout
    }
    clearAdminSession();
    localStorage.removeItem(ADMIN_ROLES_KEY);
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = "/admin/login";
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAdminAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook lấy context xác thực admin
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
