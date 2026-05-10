const router = require("express").Router();
const authRoutes = require("./client/auth.routes");
const profileRoutes = require("./client/profile.routes");
const vocabularyRoutes = require("./client/vocabulary.routes");
const vocabularySetRoutes = require("./client/vocabularySet.routes");
const practiceRoutes = require("./client/practice.routes");
const favoriteVocabularyRoutes = require("./client/favoriteVocabulary.routes");
const moderationRoutes = require("./client/moderation.routes");
const adminVocabularySetRoutes = require("./admin/vocabularySet.routes");
const adminReadingLessonRoutes = require("./admin/readingLesson.routes");
const readingLessonRoutes = require("./client/readingLesson.routes");
const listeningLessonRoutes = require("./client/listeningLesson.routes");
const readingQuestionRoutes = require("./client/readingQuestion.routes");
const listeningPracticeRoutes = require("./client/listeningPractice.routes");
const readingPracticeRoutes = require("./client/readingPractice.routes");
const listeningQuestionRoutes = require("./client/listeningQuestion.routes");
const learningStatsRoutes = require("./client/learningStats.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/vocabulary", vocabularyRoutes);
router.use("/vocabulary-sets", vocabularySetRoutes);
router.use("/vocabulary-sets/practice", practiceRoutes);
router.use("/favorites", favoriteVocabularyRoutes);
router.use("/moderation-requests", moderationRoutes);

// Admin routes
router.use("/admin/vocabulary-sets", adminVocabularySetRoutes);
router.use("/admin", adminReadingLessonRoutes);

// Reading lessons
router.use("/reading-lessons", readingLessonRoutes);

// Listening lessons
router.use("/listening-lessons", listeningLessonRoutes);

// Listening questions — gộp nested & standalone vào 1 router duy nhất
// Mount 2 lần: /listening-lessons (nested) + /listening-questions (standalone)
router.use("/listening-lessons", listeningQuestionRoutes);
router.use("/listening-questions", listeningQuestionRoutes);

// Listening practice
router.use("/listening-lessons", listeningPracticeRoutes);

// Reading practice
router.use("/reading-lessons", readingPracticeRoutes);

// Reading questions — gộp nested & standalone vào 1 router duy nhất
// Mount 2 lần: /reading-lessons (nested) + /reading-questions (standalone)
router.use("/reading-lessons", readingQuestionRoutes);
router.use("/reading-questions", readingQuestionRoutes);

// Thống kê học tập
router.use("/learning-stats", learningStatsRoutes);

module.exports = router;

