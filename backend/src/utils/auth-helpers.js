const { AppError } = require("./appError");
const profileModel = require("../api/v1/repositories/profile.model");
const roleModel = require("../api/v1/repositories/role.model");
const {
  formatUser,
  formatProfile,
  formatSession,
  formatRoleIds,
} = require("./auth-formatters");

/**
 * Map lỗi từ Supabase Auth → AppError có HTTP status code phù hợp.
 * Tránh expose raw Supabase message ra client.
 *
 * @param {Object} error - Supabase error object
 * @returns {AppError}
 */
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

/**
 * Build response payload chung cho register và login.
 * Query profile và roles song song bằng Promise.all để tối ưu hiệu năng.
 *
 * @param {Object} user    - Supabase user object
 * @param {Object} session - Supabase session object
 * @returns {Object} { user, profile, roleIds, session }
 */
const buildAuthResponse = async (user, session) => {
  const accessToken = session?.access_token || null;
  const userId = user?.id || null;

  const [profile, roleIds] = await Promise.all([
    accessToken && userId
      ? profileModel.getProfileById(accessToken, userId)
      : Promise.resolve(null),
    accessToken && userId
      ? roleModel.getRoleIdsByUserId(accessToken, userId)
      : Promise.resolve([]),
  ]);

  return {
    user: formatUser(user),
    profile: formatProfile(profile),
    roleIds: formatRoleIds(roleIds),
    session: formatSession(session),
  };
};

module.exports = { mapAuthError, buildAuthResponse };
