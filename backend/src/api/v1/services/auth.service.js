const authModel = require("../models/auth.model");
const profileModel = require("../models/profile.model");
const roleModel = require("../models/role.model");
const { AppError } = require("../../../utils/appError");
const {
  formatUser,
  formatProfile,
  formatSession,
  formatRoleIds,
} = require("../../../utils/auth-formatters");

// -------------------------------------------------------
// Helper: Map Supabase Auth error → AppError có HTTP code
// -------------------------------------------------------
const mapAuthError = (error) => {
  const message = error?.message || "Xác thực thất bại";
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("user already exists")) {
    return new AppError("Email này đã được đăng ký", 409);
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return new AppError("Email hoặc mật khẩu không đúng", 401);
  }
  if (lower.includes("email not confirmed")) {
    return new AppError("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư", 403);
  }
  if (lower.includes("too many requests")) {
    return new AppError("Quá nhiều yêu cầu. Vui lòng thử lại sau", 429);
  }
  if (lower.includes("weak password")) {
    return new AppError("Mật khẩu quá yếu", 400);
  }

  return new AppError(message, 400);
};

// -------------------------------------------------------
// Helper: Build response chung cho register và login
// -------------------------------------------------------
const _buildAuthResponse = async (user, session) => {
  const accessToken = session?.access_token || null;
  const userId = user?.id || null;

  const [profile, roleIds] = await Promise.all([
    accessToken && userId ? profileModel.getProfileById(accessToken, userId) : Promise.resolve(null),
    accessToken && userId ? roleModel.getRoleIdsByUserId(accessToken, userId) : Promise.resolve([]),
  ]);

  return {
    user: formatUser(user),
    profile: formatProfile(profile),
    roleIds: formatRoleIds(roleIds),
    session: formatSession(session),
  };
};

// -------------------------------------------------------
// Register
// -------------------------------------------------------
const register = async ({ email, password, userName, dayOfBirth }) => {
  const userData = {};

  if (userName) userData.user_name = userName;
  if (dayOfBirth) userData.day_of_birth = dayOfBirth;

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

  return _buildAuthResponse(user, session);
};

// -------------------------------------------------------
// Login
// -------------------------------------------------------
const login = async ({ email, password }) => {
  const { data, error } = await authModel.signInWithPassword({ email, password });

  if (error) {
    throw mapAuthError(error);
  }

  return _buildAuthResponse(data.user, data.session);
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

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};

