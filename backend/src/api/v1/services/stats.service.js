const {
  countUsersByRoleId,
  countUsersByStatus,
  countVocabularySets,
  countVocabularyPractice,
  countReadingLessons,
  countReadingPractice,
  countListeningLessons,
  countListeningPractice,
} = require("../repositories/stats.repository");

/**
 * Lấy toàn bộ thống kê hệ thống.
 * Chạy song song các query để tối ưu hiệu năng.
 */
const getSystemStats = async () => {
  const [
    totalUsers,
    totalContentManagers,
    totalAdmins,
    activeAccounts,
    inactiveAccounts,
    totalVocabularySets,
    publicVocabularySets,
    vocabularyPracticeCount,
    totalReadingLessons,
    publicReadingLessons,
    readingPracticeCount,
    totalListeningLessons,
    publicListeningLessons,
    listeningPracticeCount,
  ] = await Promise.all([
    countUsersByRoleId(1),
    countUsersByRoleId(2),
    countUsersByRoleId(3),
    countUsersByStatus("active"),
    countUsersByStatus("inactive"),
    countVocabularySets(),
    countVocabularySets("public"),
    countVocabularyPractice(),
    countReadingLessons(),
    countReadingLessons("public"),
    countReadingPractice(),
    countListeningLessons(),
    countListeningLessons("public"),
    countListeningPractice(),
  ]);

  return {
    users: {
      total: totalUsers,
      contentManagers: totalContentManagers,
      admins: totalAdmins,
      active: activeAccounts,
      inactive: inactiveAccounts,
    },
    vocabularySets: {
      total: totalVocabularySets,
      public: publicVocabularySets,
      practiceCount: vocabularyPracticeCount,
    },
    readingLessons: {
      total: totalReadingLessons,
      public: publicReadingLessons,
      practiceCount: readingPracticeCount,
    },
    listeningLessons: {
      total: totalListeningLessons,
      public: publicListeningLessons,
      practiceCount: listeningPracticeCount,
    },
  };
};

module.exports = {
  getSystemStats,
};
