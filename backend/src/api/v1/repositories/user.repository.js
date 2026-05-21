const { createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lấy danh sách toàn bộ người dùng (mọi role).
 * Hỗ trợ phân trang, sắp xếp, tìm kiếm theo email,
 * lọc theo trạng thái (status), lọc theo vai trò (role),
 * và loại trừ user hiện tại khỏi danh sách.
 */
const getAllUsers = async ({
  page = 1,
  limit = 20,
  sortColumn = "created_at",
  ascending = false,
  search = "",
  status = null,
  role = null,
  excludeUserId = null,
}) => {
  const client = createAdminClient();

  const from = (page - 1) * limit;

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
    .gt("id", "00000000-0000-0000-0000-000000000000");

  if (search && search.trim() !== "") {
    query = query.ilike("email", `%${search.trim()}%`);
  }

  if (status && ["active", "inactive"].includes(status)) {
    query = query.eq("status", status);
  }

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  query = query.order(sortColumn, { ascending });
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[user.model] getAllUsers error:", error);
    throw new AppError("Không thể lấy danh sách người dùng", 500);
  }

  let users = (data || []).map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    roles: [],
  }));

  if (role && ["user", "content_manager", "admin"].includes(role)) {
    const roleIdMap = { user: 1, content_manager: 2, admin: 3 };
    const targetRoleId = roleIdMap[role];

    const { data: userRolesData, error: userRolesError } = await client
      .from("user_roles")
      .select("user_id")
      .eq("role_id", targetRoleId);

    if (!userRolesError && userRolesData) {
      const allowedUserIds = new Set(userRolesData.map((ur) => ur.user_id));
      users = users.filter((u) => allowedUserIds.has(u.id));
    }
  }

  if (users.length > 0) {
    const userIds = users.map((u) => u.id);

    const { data: userRolesData, error: userRolesError } = await client
      .from("user_roles")
      .select("user_id, role_id, roles(name)")
      .in("user_id", userIds);

    if (!userRolesError && userRolesData) {
      const roleNameMap = { 1: "user", 2: "content_manager", 3: "admin" };
      const rolesByUser = {};

      for (const ur of userRolesData) {
        if (!rolesByUser[ur.user_id]) {
          rolesByUser[ur.user_id] = [];
        }
        if (ur.roles && ur.roles.name) {
          rolesByUser[ur.user_id].push(ur.roles.name);
        } else {
          rolesByUser[ur.user_id].push(roleNameMap[ur.role_id] || `role_${ur.role_id}`);
        }
      }

      users = users.map((u) => ({
        ...u,
        roles: rolesByUser[u.id] || [],
      }));
    }
  }

  return { users, total: count || 0 };
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

  const { error: authError } = await client.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("[user.model] deleteUserPermanently - auth delete error:", authError);
    throw new AppError("Không thể xóa tài khoản khỏi hệ thống xác thực", 500);
  }

  return { deleted: true, userId };
};

/**
 * Cập nhật role của người dùng (cấp hoặc thu hồi role).
 * @param {string} userId
 * @param {number} roleId
 * @param {"grant"|"revoke"} action - 'grant' để cấp role, 'revoke' để thu hồi
 */
const updateUserRole = async (userId, roleId, action) => {
  const client = createAdminClient();

  if (action === "grant") {
    const { error } = await client
      .from("user_roles")
      .upsert({ user_id: userId, role_id: roleId }, { onConflict: "user_id,role_id" });

    if (error) {
      console.error("[user.model] grantUserRole error:", error);
      throw new AppError("Không thể cấp vai trò cho người dùng", 500);
    }
    return { userId, roleId, action: "grant" };
  } else if (action === "revoke") {
    const { error } = await client
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleId);

    if (error) {
      console.error("[user.model] revokeUserRole error:", error);
      throw new AppError("Không thể thu hồi vai trò của người dùng", 500);
    }
    return { userId, roleId, action: "revoke" };
  }

  throw new AppError("Hành động không hợp lệ. Chỉ chấp nhận 'grant' hoặc 'revoke'", 400);
};

module.exports = {
  getAllUsers,
  updateUsersStatus,
  getUserById,
  deleteUserPermanently,
  updateUserRole,
};
