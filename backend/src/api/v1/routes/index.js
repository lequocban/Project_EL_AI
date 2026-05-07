const router = require("express").Router();
const authRoutes = require("./client/auth.routes");
const profileRoutes = require("./client/profile.routes");
const vocabularyRoutes = require("./client/vocabulary.routes");
const vocabularySetRoutes = require("./client/vocabularySet.routes");
const practiceRoutes = require("./client/practice.routes");
const favoriteVocabularyRoutes = require("./client/favoriteVocabulary.routes");
const moderationRoutes = require("./client/moderation.routes");
const adminVocabularySetRoutes = require("./admin/vocabularySet.routes");

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

module.exports = router;

