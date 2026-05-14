const profileModel = require("../repositories/profile.model");
const { AppError } = require("../../../utils/appError");
const { formatProfile } = require("../../../utils/auth-formatters");
const { toDbDate } = require("../../../utils/date.utils");

// -------------------------------------------------------
// Lấy thông tin hồ sơ cá nhân
// -------------------------------------------------------
const getProfile = async (accessToken, userId) => {
  const profile = await profileModel.getProfileById(accessToken, userId);

  if (!profile) {
    throw new AppError("Không tìm thấy hồ sơ người dùng", 404);
  }

  return formatProfile(profile);
};

// -------------------------------------------------------
// Cập nhật thông tin hồ sơ cá nhân (trừ mật khẩu)
// -------------------------------------------------------
const updateProfile = async (accessToken, userId, { userName, dayOfBirth }) => {
  // Chỉ cập nhật các trường được phép, bỏ undefined
  const updates = {};
  if (userName !== undefined) updates.user_name = userName;
  if (dayOfBirth !== undefined) updates.day_of_birth = toDbDate(dayOfBirth);
  // Luôn cập nhật updated_at khi có thay đổi
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length === 0) {
    throw new AppError("Không có thông tin nào để cập nhật", 400);
  }

  const updated = await profileModel.updateProfile(accessToken, userId, updates);

  if (!updated) {
    throw new AppError("Cập nhật thất bại, vui lòng thử lại", 500);
  }

  return formatProfile(updated);
};

module.exports = { getProfile, updateProfile };
