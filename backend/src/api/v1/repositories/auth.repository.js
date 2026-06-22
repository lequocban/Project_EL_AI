const { supabase, createAuthedClient, authAdmin } = require("../../../config/supabase");
const env = require("../../../config/env.config");

const signUp = async (payload) => {
  return supabase.auth.signUp(payload);
};

const signInWithPassword = async (payload) => {
  return supabase.auth.signInWithPassword(payload);
};

const signOut = async (accessToken) => {
  const client = createAuthedClient(accessToken);
  return client.auth.signOut();
};

const refreshSession = async (refreshToken) => {
  return supabase.auth.refreshSession({ refresh_token: refreshToken });
};

// -------------------------------------------------------
// Find user by email (admin)
const findUserByEmail = async (email) => {
  const user = await authAdmin.getUserByEmail(email);
  return !!user;
};

// -------------------------------------------------------
// Update user password (admin)
// -------------------------------------------------------
const updateUserPassword = async (email, newPassword) => {
  const user = await authAdmin.getUserByEmail(email);
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }
  await authAdmin.updateUserPassword(user.id, newPassword);
};

const updateUserPasswordById = async (userId, newPassword) => {
  const { data, error } = await authAdmin.updateUserPassword(userId, newPassword);
  if (error) throw new Error(error.message);
  return data;
};

// -------------------------------------------------------
// Google OAuth — lấy URL redirect sang Google
// -------------------------------------------------------
const signInWithOAuth = async () => {
  // redirectTo phải là frontend page để JS có thể đọc được hash fragment
  // (Supabase implicit flow gửi token qua #hash, server không đọc được)
  const redirectTo = `${env.frontendUrl}/auth/callback`;
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
};

// -------------------------------------------------------
// Google OAuth — trao đổi code lấy session
// -------------------------------------------------------
const exchangeCodeForSession = async (code) => {
  return supabase.auth.exchangeCodeForSession(code);
};

module.exports = {
  signUp,
  signInWithPassword,
  signOut,
  refreshSession,
  findUserByEmail,
  updateUserPassword,
  updateUserPasswordById,
  signInWithOAuth,
  exchangeCodeForSession,
};

