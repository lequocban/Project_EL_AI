import React, { createContext, useState, useContext, useEffect } from "react";
import { adminApi } from "@/api/admin/adminApi";

const AdminAuthContext = createContext();
const ADMIN_ACCESS_TOKEN_KEY = "englishup_admin_token";

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAuth();
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
    } catch (err) {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
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
      }
      // Backend đã validate role bằng requireManagerOrAdmin
      // Nếu role không phải admin/content_manager sẽ throw error
      await checkAdminAuth();
      return response;
    } catch (err) {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      setAdmin(null);
      setIsAuthenticated(false);
      const msg = err.message || "Đăng nhập thất bại";
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Bỏ qua lỗi khi logout
    }
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
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
