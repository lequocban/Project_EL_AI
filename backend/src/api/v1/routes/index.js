const router = require("express").Router();
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const vocabularyRoutes = require("./vocabulary.routes");
const vocabularySetRoutes = require("./vocabularySet.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/vocabulary", vocabularyRoutes);
router.use("/vocabulary-sets", vocabularySetRoutes);

module.exports = router;

