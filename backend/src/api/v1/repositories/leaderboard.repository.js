const { createAdminClient } = require("../../../config/supabase");
const { AppError } = require("../../../utils/appError");

/**
 * Lấy toàn bộ user có ít nhất 1 lượt làm bài (từ cả 3 bảng practice).
 * Trả về user info + tổng lượt làm bài + điểm trung bình.
 * @returns {Promise<Array>}
 */
const getAllUsersWithStats = async () => {
  const client = createAdminClient();

  const [vocabResult, readingResult, listeningResult] = await Promise.all([
    client
      .from("vocabulary_practice")
      .select("user_id, score")
      .not("score", "is", null),
    client
      .from("reading_practice")
      .select("user_id, score")
      .not("score", "is", null),
    client
      .from("listening_practice")
      .select("user_id, score")
      .not("score", "is", null),
  ]);

  if (vocabResult.error || readingResult.error || listeningResult.error) {
    console.error("[leaderboard.model] Lỗi khi lấy dữ liệu practice:", {
      vocabError: vocabResult.error,
      readingError: readingResult.error,
      listeningError: listeningResult.error,
    });
    throw new AppError("Không thể lấy dữ liệu làm bài", 500);
  }

  const vocabData = vocabResult.data || [];
  const readingData = readingResult.data || [];
  const listeningData = listeningResult.data || [];

  const scoreMap = new Map();

  for (const row of vocabData) {
    if (!scoreMap.has(row.user_id)) {
      scoreMap.set(row.user_id, { totalScore: 0, count: 0 });
    }
    const entry = scoreMap.get(row.user_id);
    entry.totalScore += row.score;
    entry.count += 1;
  }

  for (const row of readingData) {
    if (!scoreMap.has(row.user_id)) {
      scoreMap.set(row.user_id, { totalScore: 0, count: 0 });
    }
    const entry = scoreMap.get(row.user_id);
    entry.totalScore += row.score;
    entry.count += 1;
  }

  for (const row of listeningData) {
    if (!scoreMap.has(row.user_id)) {
      scoreMap.set(row.user_id, { totalScore: 0, count: 0 });
    }
    const entry = scoreMap.get(row.user_id);
    entry.totalScore += row.score;
    entry.count += 1;
  }

  return Array.from(scoreMap.entries()).map(([userId, stats]) => ({
    user_id: userId,
    practice_count: stats.count,
    avg_score: Math.round(stats.totalScore / stats.count),
  }));
};

/**
 * Lấy thông tin hồ sơ của nhiều user theo danh sách userId.
 * @param {string[]} userIds
 * @returns {Promise<Object[]>}
 */
const getProfilesByIds = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];

  const client = createAdminClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, user_name")
    .in("id", userIds)
    .eq("status", "active");

  if (error) {
    console.error("[leaderboard.model] Lỗi khi lấy profiles:", error);
    throw new AppError("Không thể lấy thông tin người dùng", 500);
  }

  return data || [];
};

/**
 * Lấy thứ hạng của một user cụ thể.
 * @param {string} userId
 * @param {number} userScore - điểm xếp hạng của user
 * @returns {Promise<number>}
 */
const getUserRank = async (userId, userScore) => {
  const allStats = await getAllUsersWithStats();

  const rank = allStats.filter((u) => u.score > userScore).length + 1;
  return rank;
};

/**
 * Lấy thống kê làm bài theo từng kỹ năng của tất cả user.
 * @param {"vocabulary" | "reading" | "listening"} skillType - Loại kỹ năng
 * @returns {Promise<Array>} - Danh sách user với practice_count và avg_score theo kỹ năng
 */
const getStatsBySkill = async (skillType) => {
  const client = createAdminClient();

  const tableMap = {
    vocabulary: "vocabulary_practice",
    reading: "reading_practice",
    listening: "listening_practice",
  };

  const table = tableMap[skillType];
  if (!table) {
    throw new AppError("Loại kỹ năng không hợp lệ", 400);
  }

  const { data, error } = await client
    .from(table)
    .select("user_id, score")
    .not("score", "is", null);

  if (error) {
    console.error(`[leaderboard.model] Lỗi khi lấy dữ liệu ${skillType}:`, error);
    throw new AppError("Không thể lấy dữ liệu làm bài", 500);
  }

  const scoreMap = new Map();

  for (const row of data || []) {
    if (!scoreMap.has(row.user_id)) {
      scoreMap.set(row.user_id, { totalScore: 0, count: 0 });
    }
    const entry = scoreMap.get(row.user_id);
    entry.totalScore += row.score;
    entry.count += 1;
  }

  return Array.from(scoreMap.entries()).map(([userId, stats]) => ({
    user_id: userId,
    practice_count: stats.count,
    avg_score: Math.round(stats.totalScore / stats.count),
  }));
};

module.exports = {
  getAllUsersWithStats,
  getProfilesByIds,
  getUserRank,
  getStatsBySkill,
};
