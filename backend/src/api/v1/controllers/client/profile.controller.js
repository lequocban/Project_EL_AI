const profileService = require("../../services/profile.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * GET /api/v1/profile/me
 * Lấy thông tin hồ sơ cá nhân của user đang đăng nhập.
 */
const getMe = async (req, res, next) => {
  try {
    const result = await profileService.getProfile(req.accessToken, req.user.id);
    return success(res, result, "Lấy thông tin hồ sơ thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/v1/profile/me
 * Cập nhật thông tin hồ sơ cá nhân (trừ mật khẩu và email).
 */
const updateMe = async (req, res, next) => {
  try {
    const result = await profileService.updateProfile(
      req.accessToken,
      req.user.id,
      req.body
    );
    return success(res, result, "Cập nhật hồ sơ thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMe, updateMe };
