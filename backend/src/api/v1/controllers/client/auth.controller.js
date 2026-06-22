const authService = require("../../services/auth.service");
const otpService = require("../../services/otp.service");
const { success } = require("../../../../utils/responseHandler");
const env = require("../../../../config/env.config");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../../../../utils/cookie");

const registerRequestOtp = async (req, res, next) => {
  try {
    await otpService.requestRegisterOtp(req.body.email);
    return success(res, null, "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // Set refresh token vào HttpOnly Cookie (nếu có session)
    if (result.session?.refreshToken) {
      setRefreshTokenCookie(res, result.session.refreshToken);
    }

    return success(
      res,
      {
        user: result.user,
        accessToken: result.session?.accessToken || null,
        expiresAt: result.session?.expiresAt || null,
        expiresIn: result.session?.expiresIn || null,
        tokenType: result.session?.tokenType || null,
      },
      "Đăng ký thành công",
      201
    );
  } catch (error) {
    return next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    // Set refresh token vào HttpOnly Cookie
    setRefreshTokenCookie(res, result.session.refreshToken);

    return success(
      res,
      {
        user: result.user,
        accessToken: result.session.accessToken,
        expiresAt: result.session.expiresAt,
        expiresIn: result.session.expiresIn,
        tokenType: result.session.tokenType,
      },
      "Đăng nhập thành công"
    );
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"]?.slice(7) || null;
    await authService.logout(accessToken);

    // Xóa refresh token cookie
    clearRefreshTokenCookie(res);

    return success(res, null, "Đăng xuất thành công");
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenValue =
      req.cookies?.refresh_token || req.body?.refreshToken || null;

    const result = await authService.refreshToken(refreshTokenValue);

    // Set refresh token mới vào HttpOnly Cookie
    setRefreshTokenCookie(res, result.session.refreshToken);

    return success(
      res,
      {
        accessToken: result.session.accessToken,
        expiresAt: result.session.expiresAt,
        expiresIn: result.session.expiresIn,
        tokenType: result.session.tokenType,
      },
      "Làm mới token thành công"
    );
  } catch (error) {
    return next(error);
  }
};

const requestOtp = async (req, res, next) => {
  try {
    await otpService.requestOtp(req.body.email);
    return success(res, null, "Mã OTP đã được gửi đến email của bạn");
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await otpService.resetPassword(req.body);
    return success(res, null, "Đặt lại mật khẩu thành công");
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword({
      userId: req.user.id,
      email: req.user.email,
      currentPassword,
      newPassword,
    });
    return success(res, null, "Đổi mật khẩu thành công");
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const url = await authService.getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    return next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(
        `${env.frontendUrl}/login?error=${encodeURIComponent("Đăng nhập Google thất bại")}`
      );
    }

    const result = await authService.loginWithGoogleCallback(code);

    // Set refresh token vào HttpOnly Cookie
    if (result.session?.refreshToken) {
      setRefreshTokenCookie(res, result.session.refreshToken);
    }

    // Redirect về frontend kèm access token và expiresAt trong URL
    const params = new URLSearchParams({
      access_token: result.session?.accessToken || "",
      expires_at: result.session?.expiresAt || "",
    });

    return res.redirect(`${env.frontendUrl}/home?${params.toString()}`);
  } catch (error) {
    const msg = error.message || "Đăng nhập Google thất bại";
    return res.redirect(
      `${env.frontendUrl}/login?error=${encodeURIComponent(msg)}`
    );
  }
};

/**
 * POST /api/v1/auth/google/sync-session
 * Frontend gửi refresh token lên sau implicit flow.
 * Backend set refresh token vào HttpOnly Cookie.
 */
const syncSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Thiếu refresh token" });
    }
    setRefreshTokenCookie(res, refreshToken);
    return res.json({ message: "ok" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerRequestOtp,
  register,
  login,
  logout,
  refreshToken,
  requestOtp,
  resetPassword,
  changePassword,
  googleLogin,
  googleCallback,
  syncSession,
};
