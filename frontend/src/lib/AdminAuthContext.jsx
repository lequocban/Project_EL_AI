import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { adminApi, refreshAdminToken, clearAdminSession, getTokenExpiresAt } from "@/api/admin";

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
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        if (typeof refreshIntervalRef.current === "number") {
          clearTimeout(refreshIntervalRef.current);
        }
      }
    };
  }, []);

  // Kiểm tra và khôi phục phiên đăng nhập admin khi khởi động
  const checkAdminAuth = async () => {
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
      const { user } = response.data || {};
      const roles = (user?.roles || []).map(Number);
      setAdmin({
        ...response.data,
        user: {
          ...user,
          roles,
        },
        full_name: user?.userName,
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
      console.log('[DEBUG login] response.data:', response.data);
      console.log('[DEBUG login] loginUser:', loginUser);
      console.log('[DEBUG login] roles after map(Number):', roles);
      setAdmin({
        ...response.data,
        user: {
          ...loginUser,
          roles,
        },
        full_name: loginUser?.userName,
      });
      localStorage.setItem(ADMIN_ROLES_KEY, JSON.stringify(roles));
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
    // Dừng interval refresh
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      if (typeof refreshIntervalRef.current === "number") {
        clearTimeout(refreshIntervalRef.current);
      }
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
