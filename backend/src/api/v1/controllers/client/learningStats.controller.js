const learningStatsService = require("../../services/learningStats.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * GET /api/v1/learning-stats
 * Lấy thống kê học tập của user hiện tại.
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await learningStatsService.getStats(userId);

    return success(res, result, "Lấy thống kê học tập thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStats,
};
