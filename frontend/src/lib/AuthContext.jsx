import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { authApi, requestRefreshToken } from "@/api/authApi";

const AuthContext = createContext();
const ACCESS_TOKEN_KEY = "englishup_access_token";
const TOKEN_EXPIRES_AT_KEY = "englishup_token_expires_at";

// Thời gian buffer (giây) trước khi token hết hạn thì tự động refresh
const REFRESH_BUFFER_SECONDS = 300;

// Provider xác thực người dùng với tự động refresh token
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Theo dõi interval để không tạo duplicate
  const refreshIntervalRef = useRef(null);

  // Lấy thời gian hết hạn token từ localStorage
  const getTokenExpiresAt = () => {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
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

  // Tính thời gian (ms) đến lúc cần refresh token
  const getMsUntilRefresh = () => {
    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return null;
    const now = Date.now();
    const bufferMs = REFRESH_BUFFER_SECONDS * 1000;
    // expiresAt từ backend là epoch seconds, nhân 1000 để so sánh với milliseconds
    return Math.max(0, expiresAt * 1000 - bufferMs - now);
  };

  // Thiết lập interval tự động refresh token
  const setupProactiveRefresh = () => {
    // Xóa interval cũ nếu có
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    const msUntilRefresh = getMsUntilRefresh();
    if (msUntilRefresh === null) return;

    // Chờ đến lúc cần refresh rồi thiết lập interval
    const startDelay = Math.min(msUntilRefresh, 60 * 1000); // Tối đa chờ 1 phút trước khi bắt đầu interval

    const timeoutId = setTimeout(() => {
      // Thiết lập interval refresh mỗi phút
      refreshIntervalRef.current = setInterval(async () => {
        if (isTokenExpiringSoon()) {
          try {
            await requestRefreshToken();
          } catch {
            // Refresh thất bại - có thể token đã hết hạn
            // sẽ được xử lý bởi fetchWithAuth khi request tiếp theo
          }
        }
      }, 60 * 1000); // Kiểm tra mỗi phút
    }, startDelay);

    // Lưu timeout id để cleanup
    refreshIntervalRef.current = timeoutId;
  };

  useEffect(() => {
    checkUserAuth();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        if (typeof refreshIntervalRef.current === "number") {
          clearTimeout(refreshIntervalRef.current);
        }
      }
    };
  }, []);

  // Kiểm tra và khôi phục phiên đăng nhập người dùng khi khởi động
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!token) {
        // Không có token - thử refresh bằng refreshToken từ HttpOnly Cookie
        try {
          await requestRefreshToken();
          // Refresh thành công - token mới đã được lưu vào localStorage
          // Tiếp tục gọi /profile/me để lấy thông tin user
        } catch {
          // Không có refresh token hợp lệ (chưa đăng nhập hoặc refresh token đã hết hạn)
          setUser(null);
          setIsAuthenticated(false);
          setAuthChecked(true);
          return;
        }
      }

      // Có token (cũ hoặc vừa refresh) - lấy thông tin user
      const response = await authApi.me();
      const profile = response.data;
      setUser({
        ...profile,
        full_name: profile.userName,
      });
      setIsAuthenticated(true);

      // Thiết lập proactive refresh
      setupProactiveRefresh();
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  // Đăng xuất và xóa session người dùng
  const logout = async (shouldRedirect = true) => {
    // Dừng interval refresh trước
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      if (typeof refreshIntervalRef.current === "number") {
        clearTimeout(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = null;
    }

    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        logout,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook lấy context xác thực người dùng
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
