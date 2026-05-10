const statsService = require("../../services/stats.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * Lấy toàn bộ thống kê hệ thống.
 * Chỉ admin (role_id = 3) mới có quyền truy cập.
 */
const getSystemStats = async (req, res, next) => {
  try {
    const stats = await statsService.getSystemStats();

    return success(res, stats, "Lấy thống kê hệ thống thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSystemStats,
};
