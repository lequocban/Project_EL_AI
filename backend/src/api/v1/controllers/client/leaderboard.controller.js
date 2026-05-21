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

/**
 * Lấy bảng xếp hạng theo kỹ năng cụ thể.
 * Query params: skill (vocabulary|reading|listening), page, limit
 */
const getLeaderboardBySkill = async (req, res, next) => {
  try {
    const { skill } = req.query;
    const { page, limit } = parsePagination(req.query, {
      defaultLimit: 10,
      maxLimit: 50,
    });

    if (!skill) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Tham số 'skill' là bắt buộc. Chọn: vocabulary, reading, hoặc listening",
      });
    }

    const result = await leaderboardService.getLeaderboardBySkill({
      skill,
      page,
      limit,
      currentUserId: req.user?.id || null,
    });

    return success(res, result, "Lấy bảng xếp hạng theo kỹ năng thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLeaderboard,
  getLeaderboardBySkill,
};
