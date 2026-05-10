const userService = require("../../services/user.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * Lấy danh sách người dùng (role_id = 1).
 * Chỉ admin (role_id = 3) mới có quyền truy cập.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || null;

    const result = await userService.getAllUsers(req.query, currentUserId);

    return success(res, result, "Lấy danh sách người dùng thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * Cập nhật trạng thái của một hoặc nhiều người dùng.
 * Chỉ admin (role_id = 3) mới có quyền.
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { userIds, status } = req.body;

    const result = await userService.updateUserStatus(userIds, status);

    return success(
      res,
      result,
      `Đã cập nhật trạng thái của ${result.updatedCount} người dùng`
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Lấy chi tiết người dùng theo id.
 * Chỉ admin (role_id = 3) mới có quyền.
 */
const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserDetail(id);

    return success(res, user, "Lấy thông tin người dùng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserDetail,
  updateUserStatus,
};
