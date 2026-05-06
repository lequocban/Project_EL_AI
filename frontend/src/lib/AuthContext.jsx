import React, { createContext, useState, useContext, useEffect } from "react";
import { authApi } from "@/api/authApi";

const AuthContext = createContext();
const ACCESS_TOKEN_KEY = "base44_access_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await authApi.me();
      const profile = response.data;
      setUser({
        ...profile,
        full_name: profile.userName,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async (shouldRedirect = true) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
