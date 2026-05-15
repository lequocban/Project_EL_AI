const router = require("express").Router();
const explainByAIController = require("../../controllers/client/explainByAI.controller");
const { explainByAISchema } = require("../../validations/explainByAI.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  requireAuth,
  validateBody(explainByAISchema),
  explainByAIController.explainAnswer
);

module.exports = router;
