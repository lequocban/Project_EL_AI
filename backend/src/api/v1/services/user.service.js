const {
  getUsersByRole,
  updateUsersStatus,
  getUserById,
  deleteUserPermanently,
} = require("../repositories/user.model");
const { AppError } = require("../../../utils/appError");
const { toApiDate } = require("../../../utils/date.utils");
const { parsePagination } = require("../../../utils/pagination");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");
const { parseSortParams } = require("../../../utils/sorting");

const ALLOWED_SORT_FIELDS = ["created_at", "email", "status"];

/**
 * Lấy danh sách người dùng (role_id = 1) với phân trang, sắp xếp, tìm kiếm.
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

  const { users, total } = await getUsersByRole({
    page,
    limit,
    sortColumn,
    ascending,
    search,
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

module.exports = {
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  deleteUser,
};
