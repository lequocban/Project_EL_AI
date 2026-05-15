const { supabase, createAuthedClient, authAdmin } = require("../../../config/supabase");

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

module.exports = {
  signUp,
  signInWithPassword,
  signOut,
  refreshSession,
  findUserByEmail,
  updateUserPassword,
  updateUserPasswordById,
};

