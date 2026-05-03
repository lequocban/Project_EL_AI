const { createAuthedClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

const getProfileById = async (accessToken, userId) => {
  if (!accessToken) {
    return null;
  }

  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("id, user_name, email, day_of_birth")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new AppError(error.message, 400);
  }

  return data;
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
    .select("id, user_name, email, day_of_birth")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return data;
};

module.exports = {
  getProfileById,
  updateProfile,
};
