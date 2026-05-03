const { createClient } = require("@supabase/supabase-js");
const env = require("./env.config");
const { normalizeSupabaseKey } = require("../utils/supabase-key");

const rawKey =
  env.supabaseServiceRoleKey || env.supabaseAnonKey || env.supabaseKey;
const supabaseKey = normalizeSupabaseKey(rawKey);

const supabase = createClient(env.supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const createAuthedClient = (accessToken) => {
  return createClient(env.supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

module.exports = { supabase, createAuthedClient };
