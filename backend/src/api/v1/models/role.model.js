const { createAuthedClient } = require("../../../config/supabase");

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
      // RLS chặn hoặc bảng không tồn tại → trả [] thay vì crash
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
};

