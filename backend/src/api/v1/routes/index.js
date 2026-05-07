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
const readingQuestionRoutes = require("./client/readingQuestion.routes");
const readingQuestionItemRoutes = require("./client/readingQuestionItem.routes");

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

// Reading questions (nested under reading-lessons)
router.use("/reading-lessons", readingQuestionRoutes);
router.use("/reading-questions", readingQuestionItemRoutes);

module.exports = router;

