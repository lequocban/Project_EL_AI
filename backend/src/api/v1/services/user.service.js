const {
  getAllUsers: getAllUsersFromModel,
  updateUsersStatus,
  getUserById,
  deleteUserPermanently,
  updateUserRole: updateUserRoleModel,
} = require("../repositories/user.model");
const { AppError } = require("../../../utils/appError");
const { toApiDate } = require("../../../utils/date.utils");
const { parsePagination } = require("../../../utils/pagination");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");
const { parseSortParams } = require("../../../utils/sorting");

const ALLOWED_SORT_FIELDS = ["created_at", "email", "status"];

/**
 * Lấy danh sách người dùng với phân trang, sắp xếp, tìm kiếm,
 * lọc theo trạng thái và lọc theo vai trò.
 * Loại trừ user hiện tại khỏi danh sách.
 */
const getAllUsers = async (queryParams, excludeUserId = null) => {
  const { page, limit } = parsePagination(queryParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const { sortColumn, ascending } = parseSortParams({
    sortField: queryParams.sortField,
    sortOrder: queryParams.sortOrder,
    allowedFields: ALLOWED_SORT_FIELDS,
    defaultField: "created_at",
    defaultOrder: "desc",
  });

  const search = queryParams.search || "";
  const status = queryParams.status || null;
  const role = queryParams.role || null;

  const { users, total } = await getAllUsersFromModel({
    page,
    limit,
    sortColumn,
    ascending,
    search,
    status,
    role,
    excludeUserId,
  });

  return buildPaginationResponse(users, { page, limit, total, maxLimit: 100 });
};

/**
 * Lấy chi tiết người dùng theo id, bao gồm đầy đủ thông tin.
 */
const getUserDetail = async (userId) => {
  const profile = await getUserById(userId);

  return {
    id: profile.id,
    userName: profile.user_name,
    email: profile.email,
    dayOfBirth: profile.day_of_birth ? toApiDate(profile.day_of_birth) : null,
    status: profile.status,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

/**
 * Cập nhật trạng thái của một hoặc nhiều user.
 * @param {string[]} userIds - Danh sách user IDs
 * @param {string} status - Trạng thái mới ('active' hoặc 'inactive')
 */
const updateUserStatus = async (userIds, status) => {
  if (!userIds || userIds.length === 0) {
    return { updatedCount: 0 };
  }

  const updatedCount = await updateUsersStatus(userIds, status);

  return { updatedCount };
};

/**
 * Xóa vĩnh viễn tài khoản người dùng.
 * Chỉ xóa được khi tài khoản đang ở trạng thái inactive.
 */
const deleteUser = async (userId) => {
  const profile = await getUserById(userId);

  if (profile.status !== "inactive") {
    throw new AppError("Chỉ có thể xóa tài khoản đang ở trạng thái inactive", 400);
  }

  await deleteUserPermanently(userId);

  return { deletedUserId: userId };
};

/**
 * Cấp hoặc thu hồi role cho người dùng.
 * Chỉ admin (role_id = 3) mới có quyền thực hiện.
 * @param {string} targetUserId - ID người dùng bị thay đổi role
 * @param {string} role - Tên role ('user', 'content_manager', 'admin')
 * @param {"grant"|"revoke"} action - 'grant' để cấp, 'revoke' để thu hồi
 * @param {string} adminId - ID admin đang thực hiện thao tác
 */
const updateUserRole = async (targetUserId, role, action, adminId) => {
  const roleIdMap = { user: 1, content_manager: 2, admin: 3 };

  if (!roleIdMap[role]) {
    throw new AppError("Role không hợp lệ. Các role hợp lệ: user, content_manager, admin", 400);
  }

  if (!["grant", "revoke"].includes(action)) {
    throw new AppError("Action không hợp lệ. Chỉ chấp nhận 'grant' hoặc 'revoke'", 400);
  }

  if (targetUserId === adminId) {
    throw new AppError("Bạn không thể tự thay đổi role của chính mình", 400);
  }

  const targetProfile = await getUserById(targetUserId);
  if (!targetProfile) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const roleId = roleIdMap[role];
  const result = await updateUserRoleModel(targetUserId, roleId, action);

  return {
    userId: targetUserId,
    role,
    action,
    message: action === "grant"
      ? `Đã cấp vai trò '${role}' cho người dùng`
      : `Đã thu hồi vai trò '${role}' của người dùng`,
  };
};

module.exports = {
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  deleteUser,
  updateUserRole,
};
