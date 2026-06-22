const { toApiDate } = require("./date.utils");

const formatUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
};

const formatProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    email: profile.email || null,
    userName: profile.user_name || null,
    dayOfBirth: toApiDate(profile.day_of_birth),
    authProvider: profile.auth_provider || null,
  };
};

const formatSession = (session) => {
  if (!session) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = session.expires_at ? session.expires_at - now : null;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    expiresIn: expiresIn,
    tokenType: session.token_type,
  };
};

const formatRoleIds = (roleIds) => {
  if (!Array.isArray(roleIds)) {
    return [];
  }

  return roleIds;
};

module.exports = {
  formatUser,
  formatProfile,
  formatSession,
  formatRoleIds,
};

