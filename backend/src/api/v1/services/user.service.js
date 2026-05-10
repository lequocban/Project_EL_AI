const { getUsersByRole, countUsersByRole } = require("../repositories/user.model");
const { toApiDate } = require("../../../utils/date.utils");

/**
 * Lấy danh sách người dùng (role_id = 1) với phân trang.
 */
const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const [userData, total] = await Promise.all([
    getUsersByRole({ page, limit }),
    countUsersByRole(1),
  ]);

  const totalPages = Math.ceil(total / limit);

  const users = userData.users.map((user) => ({
    ...user,
    dayOfBirth: user.dayOfBirth ? toApiDate(user.dayOfBirth) : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

module.exports = {
  getAllUsers,
};
