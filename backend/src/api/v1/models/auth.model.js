const { supabase, createAuthedClient } = require("../../../config/supabase");

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

module.exports = {
  signUp,
  signInWithPassword,
  signOut,
  refreshSession,
};

