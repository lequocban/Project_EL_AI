const router = require("express").Router();
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

module.exports = router;

