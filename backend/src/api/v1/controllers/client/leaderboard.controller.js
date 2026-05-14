const leaderboardService = require("../../services/leaderboard.service");
const { parsePagination } = require("../../../../utils/pagination");
const { success } = require("../../../../utils/responseHandler");

/**
 * Lấy bảng xếp hạng top người dùng.
 * Query params: page (default 1), limit (default 10, max 50)
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, {
      defaultLimit: 10,
      maxLimit: 50,
    });

    const result = await leaderboardService.getLeaderboard({
      page,
      limit,
      currentUserId: req.user?.id || null,
    });

    return success(res, result, "Lấy bảng xếp hạng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLeaderboard,
};
