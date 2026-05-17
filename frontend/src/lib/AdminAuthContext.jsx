import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { adminApi, refreshAdminToken, clearAdminSession, getTokenExpiresAt } from "@/api/admin";

const AdminAuthContext = createContext();
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";
const ADMIN_TOKEN_EXPIRES_AT_KEY = "englishup_admin_token_expires_at";
const REFRESH_BUFFER_SECONDS = 300;

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshIntervalRef = useRef(null);

  // Tính thời gian (ms) đến khi cần refresh
  const getMsUntilRefresh = () => {
    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return null;
    const now = Date.now();
    const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
    // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
    return Math.max(0, expiresAt * 1000 - bufferMs - now);
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

  // Thiết lập interval tự động refresh token trước khi hết hạn
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

  // Kiểm tra auth khi app mount - chỉ gọi khi có token
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
      const profile = response.data;
      setAdmin({
        ...profile,
        full_name: profile.userName,
      });
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

  const login = async (email, password) => {
    setError("");
    try {
      const response = await adminApi.login(email, password);
      if (response.data?.accessToken) {
        localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, response.data.accessToken);
        if (response.data.expiresAt) {
          localStorage.setItem(ADMIN_TOKEN_EXPIRES_AT_KEY, String(response.data.expiresAt));
        }
      }
      // Backend đã validate role bằng requireManagerOrAdmin
      // Nếu role không phải admin/content_manager sẽ throw error
      await checkAdminAuth();
      return response;
    } catch (err) {
      clearAdminSession();
      setAdmin(null);
      setIsAuthenticated(false);
      const msg = err.message || "Đăng nhập thất bại";
      setError(msg);
      throw err;
    }
  };

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

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
