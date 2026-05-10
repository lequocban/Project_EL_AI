const authModel = require("../repositories/auth.model");
const profileModel = require("../repositories/profile.model");
const { getRoleIdsByUserIdService } = require("../repositories/role.model");
const { AppError } = require("../../../utils/appError");
const { formatSession } = require("../../../utils/auth-formatters");
const { mapAuthError, buildAuthResponse } = require("../../../utils/auth-helpers");
const { toDbDate, toApiDate } = require("../../../utils/date.utils");

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

// -------------------------------------------------------
// Admin Login
// Chỉ cho phép user có role_id = 2 (content_manager) hoặc 3 (admin)
// -------------------------------------------------------
const adminLogin = async ({ email, password }) => {
  const { data, error } = await authModel.signInWithPassword({ email, password });

  if (error) {
    throw mapAuthError(error);
  }

  const user = data.user;
  const session = data.session;

  const roleIds = await getRoleIdsByUserIdService(user.id);
  const allowedRoles = [2, 3]; // content_manager, admin

  const hasPermission = allowedRoles.some((roleId) => roleIds.includes(roleId));
  if (!hasPermission) {
    throw new AppError("Bạn không có quyền truy cập trang quản trị", 403);
  }

  const response = await buildAuthResponse(user, session);
  return {
    ...response,
    user: {
      ...response.user,
      roles: roleIds,
    },
  };
};

// -------------------------------------------------------
// Lay thong tin profile cua admin hien tai (kem role)
// -------------------------------------------------------
const getAdminProfile = async (user, accessToken) => {
  const [profile, roleIds] = await Promise.all([
    accessToken ? profileModel.getProfileById(accessToken, user.id) : Promise.resolve(null),
    getRoleIdsByUserIdService(user.id),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      userName: profile?.user_name || null,
      dayOfBirth: profile?.day_of_birth ? toApiDate(profile.day_of_birth) : null,
      roles: roleIds,
    },
  };
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  adminLogin,
  getAdminProfile,
};

