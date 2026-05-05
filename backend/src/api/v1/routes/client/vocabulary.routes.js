const router = require("express").Router();
const vocabularyController = require("../../controllers/client/vocabulary.controller");
const { lookupWordSchema } = require("../../validations/vocabulary.validation");
const { validateBody } = require("../../validations/validate");
const { requireAuth } = require("../../middlewares/auth.middleware");

router.post(
  "/lookup",
  requireAuth,
  validateBody(lookupWordSchema),
  vocabularyController.lookupWord
);

module.exports = router;
