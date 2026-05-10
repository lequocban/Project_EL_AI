const authService = require("../../services/auth.service");
const { success } = require("../../../../utils/responseHandler");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../../../../utils/cookie");

/**
 * Đăng nhập trang admin.
 * Chỉ cho phép user có role_id = 2 (content_manager) hoặc 3 (admin).
 */
const adminLogin = async (req, res, next) => {
  try {
    const result = await authService.adminLogin(req.body);

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
      "Đăng nhập quản trị thành công"
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Lay thong tin profile admin hien tai (kem role).
 * Chi cho phep user co role_id = 2 hoac 3.
 */
const getMe = async (req, res, next) => {
  try {
    const result = await authService.getAdminProfile(req.user, req.accessToken);
    return success(res, result, "Lấy thông tin quản trị thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * Đăng xuất khỏi trang admin.
 */
const adminLogout = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"]?.slice(7) || null;
    await authService.logout(accessToken);

    clearRefreshTokenCookie(res);

    return success(res, null, "Đăng xuất quản trị thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  adminLogin,
  getMe,
  adminLogout,
};
