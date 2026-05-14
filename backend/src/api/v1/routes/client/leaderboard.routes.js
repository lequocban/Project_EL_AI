const router = require("express").Router();
const leaderboardController = require("../../controllers/client/leaderboard.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.use(verifyToken, requireAuth);

router.get("/", leaderboardController.getLeaderboard);

module.exports = router;
