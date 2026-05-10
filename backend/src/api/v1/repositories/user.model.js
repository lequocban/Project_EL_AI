const { createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lấy danh sách user có role_id = 1 (người dùng thường).
 * Không trả về mật khẩu.
 */
const getUsersByRole = async ({ page = 1, limit = 20 }) => {
  const client = createAdminClient();

  const from = (page - 1) * limit;

  const { data, error } = await client
    .from("user_roles")
    .select(`
      user_id,
      role_id,
      profiles!inner (
        id,
        user_name,
        email,
        day_of_birth,
        status,
        created_at,
        updated_at
      )
    `)
    .eq("role_id", 1)
    .order("profiles(created_at)", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    throw new AppError("Không thể lấy danh sách người dùng", 500);
  }

  if (!data || data.length === 0) {
    return {
      users: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const users = data.map((row) => ({
    id: row.profiles.id,
    userName: row.profiles.user_name,
    email: row.profiles.email,
    dayOfBirth: row.profiles.day_of_birth,
    status: row.profiles.status,
    createdAt: row.profiles.created_at,
    updatedAt: row.profiles.updated_at,
  }));

  return { users, pagination: { page, limit } };
};

/**
 * Đếm tổng số user có role_id = 1.
 */
const countUsersByRole = async (roleId = 1) => {
  const client = createAdminClient();

  const { count, error } = await client
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (error) {
    throw new AppError("Không thể đếm số người dùng", 500);
  }

  return count || 0;
};

module.exports = {
  getUsersByRole,
  countUsersByRole,
};
