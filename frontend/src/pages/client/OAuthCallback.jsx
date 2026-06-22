import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const ACCESS_TOKEN_KEY = "englishup_access_token";
const TOKEN_EXPIRES_AT_KEY = "englishup_token_expires_at";

/**
 * Trang xử lý callback sau khi Supabase hoàn tất Google OAuth.
 *
 * Supabase có thể redirect về đây theo 2 cách:
 *  - Implicit flow: /auth/callback#access_token=...&refresh_token=...
 *  - PKCE flow:     /auth/callback?code=...
 *
 * Ta xử lý cả hai trường hợp.
 */
export default function OAuthCallback() {
  const [status, setStatus] = useState("Đang xử lý đăng nhập...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // ── Trường hợp 1: Implicit flow — token trong URL hash fragment ──
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1)); // bỏ dấu #
        const accessToken = params.get("access_token");
        const expiresAt = params.get("expires_at");
        const expiresIn = params.get("expires_in");
        const refreshToken = params.get("refresh_token");

        if (accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

          // Tính expires_at nếu không có sẵn
          if (expiresAt) {
            localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt);
          } else if (expiresIn) {
            const expiresAtCalc = Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10);
            localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAtCalc));
          }

          // Lưu refresh token vào cookie qua backend
          if (refreshToken) {
            await syncRefreshTokenToBackend(refreshToken, accessToken);
          }

          setStatus("Đăng nhập thành công! Đang chuyển hướng...");
          window.location.replace("/home");
          return;
        }
      }

      // ── Trường hợp 2: PKCE flow — code trong query string ──
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      if (error) {
        throw new Error(errorDescription || error || "Đăng nhập Google thất bại");
      }

      if (code) {
        // Gửi code lên backend để exchange lấy session
        const res = await fetch(`/api/v1/auth/google/callback?code=${encodeURIComponent(code)}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok && res.redirected) {
          // Backend đã redirect (thành công hoặc lỗi) — follow redirect
          window.location.replace(res.url);
          return;
        }

        if (!res.ok) {
          throw new Error("Không thể hoàn tất đăng nhập");
        }

        // Nếu backend trả JSON (không redirect)
        window.location.replace("/home");
        return;
      }

      // Không có token lẫn code — xảy ra lỗi
      throw new Error("Không nhận được thông tin xác thực từ Google");
    } catch (err) {
      console.error("OAuth callback error:", err);
      setStatus(err.message || "Đăng nhập thất bại");
      setIsError(true);
      setTimeout(() => {
        window.location.replace(`/login?error=${encodeURIComponent(err.message)}`);
      }, 2500);
    }
  };

  /**
   * Gửi refresh token lên backend để set HttpOnly cookie.
   * Backend endpoint nhận refresh_token và set cookie.
   */
  const syncRefreshTokenToBackend = async (refreshToken, accessToken) => {
    try {
      await fetch("/api/v1/auth/google/sync-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Không block luồng chính nếu sync thất bại
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Zap className="w-7 h-7 text-white" />
        </div>
        {isError ? (
          <>
            <p className="text-red-500 font-semibold text-sm">{status}</p>
            <p className="text-muted-foreground text-xs">Đang chuyển về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-foreground font-semibold text-sm">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
