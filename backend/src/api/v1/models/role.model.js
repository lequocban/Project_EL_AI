const { createAuthedClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

const getRoleIdsByUserId = async (accessToken, userId) => {
  if (!accessToken || !userId) {
    return [];
  }

  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (error) {
    throw new AppError(error.message, 403);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => row.role_id);
};

module.exports = {
  getRoleIdsByUserId,
};
