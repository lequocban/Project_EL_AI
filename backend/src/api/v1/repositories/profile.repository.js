const { createAuthedClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

const getProfileById = async (accessToken, userId) => {
  if (!accessToken) {
    return null;
  }

  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("id, user_name, email, day_of_birth, status, auth_provider")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "PGRST301") {
      return null;
    }
    throw new AppError(error.message, 400);
  }

  return data;
};

/**
 * Lấy status của user từ bảng profiles (dùng service role key).
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
const getStatusByUserId = async (userId) => {
  if (!userId) {
    return null;
  }

  const { createAdminClient } = require("../../../config/supabase");
  const client = createAdminClient();

  const { data, error } = await client
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data?.status || null;
};

const updateProfile = async (accessToken, userId, updates) => {
  if (!accessToken || Object.keys(updates).length === 0) {
    return null;
  }

  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id, user_name, email, day_of_birth, auth_provider")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new AppError(error.message, 400);
  }

  return data;
};

/**
 * Lấy auth_provider của user từ bảng profiles (dùng service role key).
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
const getAuthProviderByUserId = async (userId) => {
  if (!userId) {
    return null;
  }

  const { createAdminClient } = require("../../../config/supabase");
  const client = createAdminClient();

  const { data, error } = await client
    .from("profiles")
    .select("auth_provider")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data?.auth_provider || null;
};

module.exports = {
  getProfileById,
  updateProfile,
  getStatusByUserId,
  getAuthProviderByUserId,
};
