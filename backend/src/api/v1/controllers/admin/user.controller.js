const userService = require("../../services/user.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * Lấy danh sách người dùng (role_id = 1).
 * Chỉ admin (role_id = 3) mới có quyền truy cập.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await userService.getAllUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return success(res, result, "Lấy danh sách người dùng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
};
