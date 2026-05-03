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

const mapAuthError = (error) => {
  const message = error?.message || "Authentication failed";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("already registered")) {
    return new AppError(message, 409);
  }

  return new AppError(message, 400);
};

const register = async ({ email, password, userName, dayOfBirth }) => {
  const userData = {};

  if (userName) {
    userData.user_name = userName;
  }

  if (dayOfBirth) {
    userData.day_of_birth = dayOfBirth;
  }

  const payload = { email, password };

  if (Object.keys(userData).length > 0) {
    payload.options = { data: userData };
  }

  const { data, error } = await authModel.signUp(payload);

  if (error) {
    throw mapAuthError(error);
  }

  const accessToken = data.session?.access_token || null;
  const userId = data.user?.id || null;

  if (accessToken && userId && Object.keys(userData).length > 0) {
    await profileModel.updateProfile(accessToken, userId, userData);
  }

  const profile = userId
    ? await profileModel.getProfileById(accessToken, userId)
    : null;
  const roleIds = userId
    ? await roleModel.getRoleIdsByUserId(accessToken, userId)
    : [];

  return {
    user: formatUser(data.user),
    profile: formatProfile(profile),
    roleIds: formatRoleIds(roleIds),
    session: formatSession(data.session),
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await authModel.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError(error.message, 401);
  }

  const accessToken = data.session?.access_token || null;
  const userId = data.user?.id || null;
  const profile = userId
    ? await profileModel.getProfileById(accessToken, userId)
    : null;
  const roleIds = userId
    ? await roleModel.getRoleIdsByUserId(accessToken, userId)
    : [];

  return {
    user: formatUser(data.user),
    profile: formatProfile(profile),
    roleIds: formatRoleIds(roleIds),
    session: formatSession(data.session),
  };
};

module.exports = {
  register,
  login,
};
