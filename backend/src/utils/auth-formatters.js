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
    userName: profile.user_name || null,
    dayOfBirth: profile.day_of_birth || null,
  };
};

const formatSession = (session) => {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
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
