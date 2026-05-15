const learningStatsRepository = require("../repositories/learningStats.repository");

/**
 * Lấy thống kê học tập của user.
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getStats = async (userId) => {
  const stats = await learningStatsRepository.getLearningStats(userId);

  const defaultSection = () => ({
    ownedCount: 0,
    practicedCount: 0,
    practiceCount: 0,
    avgScore: 0,
  });

  const getSection = (section) => {
    if (!section || typeof section !== "object") return defaultSection();
    return {
      ownedCount: Number(section.ownedCount) || 0,
      practicedCount: Number(section.practicedCount) || 0,
      practiceCount: Number(section.practiceCount) || 0,
      avgScore: Number(section.avgScore) || 0,
    };
  };

  return {
    vocabulary: getSection(stats?.vocabulary),
    reading: getSection(stats?.reading),
    listening: getSection(stats?.listening),
  };
};

module.exports = {
  getStats,
};
