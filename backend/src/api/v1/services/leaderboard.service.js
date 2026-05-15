const leaderboardRepository = require("../repositories/leaderboard.repository");
const { buildPaginationResponse } = require("../../../utils/paginationResponse");

/**
 * Tính điểm xếp hạng, ưu tiên điểm trung bình cao hơn số lượt làm
 * để tránh người dùng spam lượt làm nhằm leo top.
 * Công thức: avg_score * 10 + practice_count
 * VD: avg 80, 5 lượt -> 80*10 + 5 = 805
 * So với: avg 70, 10 lượt -> 70*10 + 10 = 710
 * Người có điểm trung bình cao hơn sẽ thắng dù lượt làm ít hơn.
 */
const calculateRankScore = (practiceCount, avgScore) => {
  return avgScore * 10 + practiceCount;
};

/**
 * Lấy bảng xếp hạng top N người dùng.
 * @param {Object} options
 * @param {number} options.page - Trang hiện tại (1-based)
 * @param {number} options.limit - Số phần tử mỗi trang
 * @param {string} options.currentUserId - ID của user gọi API (để lấy thứ hạng)
 * @returns {Promise<Object>}
 */
const getLeaderboard = async ({ page = 1, limit = 10, currentUserId = null } = {}) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 50) limit = 10;

  const allStats = await leaderboardRepository.getAllUsersWithStats();

  const withScores = allStats.map((user) => ({
    ...user,
    score: calculateRankScore(user.practice_count, user.avg_score),
  }));

  withScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.avg_score !== a.avg_score) return b.avg_score - a.avg_score;
    return b.practice_count - a.practice_count;
  });

  const totalUsers = withScores.length;
  const offset = (page - 1) * limit;
  const paginated = withScores.slice(offset, offset + limit);

  const userIds = paginated.map((u) => u.user_id);
  const profiles = await leaderboardRepository.getProfilesByIds(userIds);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const leaderboardItems = paginated.map((u, index) => {
    const profile = profileMap.get(u.user_id);
    return {
      rank: offset + index + 1,
      user_id: u.user_id,
      user_name: profile?.user_name || "Người dùng ẩn danh",
      practice_count: u.practice_count,
      avg_score: u.avg_score,
      score: u.score,
    };
  });

  let currentUserRank = null;
  if (currentUserId) {
    const currentUserStat = allStats.find((u) => u.user_id === currentUserId);
    if (currentUserStat) {
      const userScore = calculateRankScore(currentUserStat.practice_count, currentUserStat.avg_score);
      currentUserRank = allStats.filter((u) => {
        const s = calculateRankScore(u.practice_count, u.avg_score);
        return s > userScore;
      }).length + 1;
    }
  }

  const pagination = buildPaginationResponse(leaderboardItems, {
    page,
    limit,
    total: totalUsers,
    maxLimit: 50,
  });

  return {
    leaderboard: pagination.items,
    pagination: pagination.pagination,
    current_user_rank: currentUserRank,
  };
};

module.exports = {
  getLeaderboard,
  calculateRankScore,
};
