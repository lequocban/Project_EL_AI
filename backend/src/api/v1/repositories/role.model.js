const { createAuthedClient } = require("../../../config/supabase");

/**
 * Lấy role IDs từ database (dùng access token để auth với RLS).
 * @param {string} accessToken
 * @param {string} userId
 * @returns {Promise<number[]>}
 */
const getRoleIdsByUserId = async (accessToken, userId) => {
  if (!accessToken || !userId) {
    return [];
  }

  try {
    const client = createAuthedClient(accessToken);
    const { data, error } = await client
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (error) {
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => row.role_id);
  } catch {
    return [];
  }
};

/**
 * Lấy role IDs trực tiếp từ database dùng service role key (bypass RLS).
 * Dùng trong middleware phân quyền khi cần chắc chắn lấy đúng role từ DB.
 * @param {string} userId
 * @returns {Promise<number[]>}
 */
const getRoleIdsByUserIdService = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const { createAdminClient } = require("../../../config/supabase");
    const client = createAdminClient();
    const { data, error } = await client
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (error) {
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => row.role_id);
  } catch {
    return [];
  }
};

module.exports = {
  getRoleIdsByUserId,
  getRoleIdsByUserIdService,
};

