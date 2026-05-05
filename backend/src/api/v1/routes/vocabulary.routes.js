const router = require("express").Router();
const vocabularyController = require("../controllers/vocabulary.controller");
const { lookupWordSchema } = require("../validations/vocabulary.validation");
const { validateBody } = require("../validations/validate");
const { requireAuth } = require("../middlewares/auth.middleware");

// POST /api/v1/vocabulary/lookup — Tra cứu từ vựng (yêu cầu đăng nhập)
router.post("/lookup", requireAuth, validateBody(lookupWordSchema), vocabularyController.lookupWord);

module.exports = router;
