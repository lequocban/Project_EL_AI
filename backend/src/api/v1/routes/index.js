const router = require("express").Router();
const authRoutes = require("./client/auth.routes");
const profileRoutes = require("./client/profile.routes");
const vocabularyRoutes = require("./client/vocabulary.routes");
const vocabularySetRoutes = require("./client/vocabularySet.routes");
const favoriteVocabularyRoutes = require("./client/favoriteVocabulary.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/vocabulary", vocabularyRoutes);
router.use("/vocabulary-sets", vocabularySetRoutes);
router.use("/favorites", favoriteVocabularyRoutes);

module.exports = router;

