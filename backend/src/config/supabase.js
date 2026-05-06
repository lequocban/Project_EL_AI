const { createClient } = require("@supabase/supabase-js");
const env = require("./env.config");
const { normalizeSupabaseKey } = require("../utils/supabase-key");

const rawServiceKey = env.supabaseServiceRoleKey || env.supabaseAnonKey || env.supabaseKey;
const serviceKey = normalizeSupabaseKey(rawServiceKey);

const supabase = createClient(env.supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const createAuthedClient = (accessToken) => {
  return createClient(env.supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};

const createAdminClient = () => {
  return createClient(env.supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};

const adminAuthClient = createClient(env.supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const authAdmin = {
  getUserByEmail: async (email) => {
    const { data, error } = await adminAuthClient.auth.admin.listUsers();
    if (error) return null;
    return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  },

  updateUserById: async (userId, attributes) => {
    const { data, error } = await adminAuthClient.auth.admin.updateUserById(userId, attributes);
    if (error) throw new Error(error.message);
    return data;
  },

  updateUserPassword: async (userId, newPassword) => {
    return authAdmin.updateUserById(userId, { password: newPassword });
  },
};

module.exports = {
  supabase,
  createAuthedClient,
  createAdminClient,
  authAdmin,
};
