const authModel = require("../repositories/auth.model");
const profileModel = require("../repositories/profile.model");
const { AppError } = require("../../../utils/appError");
const { formatSession } = require("../../../utils/auth-formatters");
const { mapAuthError, buildAuthResponse } = require("../../../utils/auth-helpers");
const { toDbDate } = require("../../../utils/date.utils");

// -------------------------------------------------------
// Register
// -------------------------------------------------------
const register = async ({ email, password, userName, dayOfBirth }) => {
  const userData = {};

  if (userName) userData.user_name = userName;
  if (dayOfBirth) userData.day_of_birth = toDbDate(dayOfBirth);

  const payload = { email, password };
  if (Object.keys(userData).length > 0) {
    payload.options = { data: userData };
  }

  const { data, error } = await authModel.signUp(payload);

  if (error) {
    throw mapAuthError(error);
  }

  const user = data.user;
  const session = data.session;
  const accessToken = session?.access_token || null;
  const userId = user?.id || null;

  // Nếu user có session (email confirmation tắt), cập nhật profile nếu có dữ liệu bổ sung
  if (accessToken && userId && Object.keys(userData).length > 0) {
    await profileModel.updateProfile(accessToken, userId, userData);
  }

  return buildAuthResponse(user, session);
};

// -------------------------------------------------------
// Login
// -------------------------------------------------------
const login = async ({ email, password }) => {
  const { data, error } = await authModel.signInWithPassword({ email, password });

  if (error) {
    throw mapAuthError(error);
  }

  return buildAuthResponse(data.user, data.session);
};

// -------------------------------------------------------
// Logout
// -------------------------------------------------------
const logout = async (accessToken) => {
  if (!accessToken) {
    throw new AppError("Không tìm thấy phiên đăng nhập", 401);
  }

  const { error } = await authModel.signOut(accessToken);

  if (error) {
    throw new AppError(error.message, 400);
  }
};

// -------------------------------------------------------
// Refresh Token
// -------------------------------------------------------
const refreshToken = async (refreshTokenValue) => {
  if (!refreshTokenValue) {
    throw new AppError("Refresh token không hợp lệ", 401);
  }

  const { data, error } = await authModel.refreshSession(refreshTokenValue);

  if (error) {
    throw new AppError("Refresh token hết hạn hoặc không hợp lệ", 401);
  }

  return {
    session: formatSession(data.session),
  };
};

const changePassword = async ({ userId, email, currentPassword, newPassword }) => {
  const { error } = await authModel.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (error) {
    throw new AppError("Mật khẩu hiện tại không chính xác", 400);
  }

  await authModel.updateUserPasswordById(userId, newPassword);
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
};

