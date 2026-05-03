const { supabase } = require("../../../config/supabase");

const signUp = async (payload) => {
  return supabase.auth.signUp(payload);
};

const signInWithPassword = async (payload) => {
  return supabase.auth.signInWithPassword(payload);
};

module.exports = {
  signUp,
  signInWithPassword,
};
