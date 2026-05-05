const router = require("express").Router();
const vocabularyController = require("../controllers/vocabulary.controller");
const { lookupWordSchema } = require("../validations/vocabulary.validation");
const { validateBody } = require("../validations/validate");

// POST /api/v1/vocabulary/lookup — Tra cứu từ vựng
router.post("/lookup", validateBody(lookupWordSchema), vocabularyController.lookupWord);

module.exports = router;
