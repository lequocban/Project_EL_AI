const { createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lấy danh sách user có role_id = 1 (người dùng thường).
 * Hỗ trợ phân trang, sắp xếp, tìm kiếm theo email,
 * và loại trừ user hiện tại khỏi danh sách.
 */
const getUsersByRole = async ({
  page = 1,
  limit = 20,
  sortColumn = "created_at",
  ascending = false,
  search = "",
  excludeUserId = null,
}) => {
  const client = createAdminClient();

  const from = (page - 1) * limit;

  // Bắt đầu query từ profiles vì ta cần filter + sort + search theo profiles
  let query = client
    .from("profiles")
    .select(
      `
      id,
      email,
      status,
      created_at
    `,
      { count: "exact" }
    )
    .gt("id", "00000000-0000-0000-0000-000000000000"); // Điều kiện luôn đúng, chỉ để đảm bảo row-level security

  // Tìm kiếm theo email (case-insensitive)
  if (search && search.trim() !== "") {
    query = query.ilike("email", `%${search.trim()}%`);
  }

  // Loại trừ user hiện tại
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  // Sắp xếp
  query = query.order(sortColumn, { ascending });

  // Phân trang
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[user.model] getUsersByRole error:", error);
    throw new AppError("Không thể lấy danh sách người dùng", 500);
  }

  const users = (data || []).map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  }));

  return { users, total: count || 0 };
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
    console.error("[user.model] countUsersByRole error:", error);
    throw new AppError("Không thể đếm số người dùng", 500);
  }

  return count || 0;
};

/**
 * Cập nhật trạng thái của một hoặc nhiều user.
 * @param {string[]} userIds - Danh sách user IDs cần cập nhật
 * @param {string} status - Trạng thái mới ('active' hoặc 'inactive')
 * @returns {Promise<number>} - Số lượng user đã được cập nhật
 */
const updateUsersStatus = async (userIds, status) => {
  const client = createAdminClient();

  const { data, error } = await client
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", userIds)
    .select("id");

  if (error) {
    throw new AppError("Không thể cập nhật trạng thái người dùng", 500);
  }

  return data?.length || 0;
};

/**
 * Lấy chi tiết user theo id, bao gồm đầy đủ thông tin profile.
 * @param {string} userId
 */
const getUserById = async (userId) => {
  const client = createAdminClient();

  const { data, error } = await client
    .from("profiles")
    .select("id, user_name, email, day_of_birth, status, created_at, updated_at")
    .eq("id", userId);

  if (error) {
    throw new AppError("Không thể lấy thông tin người dùng", 500);
  }

  const profile = data?.[0] || null;
  if (!profile) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return profile;
};

/**
 * Xóa vĩnh viễn user khỏi Supabase Auth và toàn bộ dữ liệu trong database.
 * Các bảng phụ thuộc (profiles, user_roles, favorite_vocabularies,
 * reading_practice, listening_practice, vocabulary_practice) sẽ tự động
 * bị xóa do ON DELETE CASCADE.
 * @param {string} userId
 */
const deleteUserPermanently = async (userId) => {
  const client = createAdminClient();

  // Xóa user khỏi Supabase Auth
  const { error: authError } = await client.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("[user.model] deleteUserPermanently - auth delete error:", authError);
    throw new AppError("Không thể xóa tài khoản khỏi hệ thống xác thực", 500);
  }

  return { deleted: true, userId };
};

module.exports = {
  getUsersByRole,
  countUsersByRole,
  updateUsersStatus,
  getUserById,
  deleteUserPermanently,
};
