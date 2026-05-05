const router = require("express").Router();
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const vocabularyRoutes = require("./vocabulary.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/vocabulary", vocabularyRoutes);

module.exports = router;

