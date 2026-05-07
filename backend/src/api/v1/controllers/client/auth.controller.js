const authService = require("../../services/auth.service");
const otpService = require("../../services/otp.service");
const { success } = require("../../../../utils/responseHandler");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../../../../utils/cookie");

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

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  requestOtp,
  resetPassword,
  changePassword,
};
