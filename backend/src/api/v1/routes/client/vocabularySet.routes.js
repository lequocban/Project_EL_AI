const router = require("express").Router();
const vocabularySetController = require("../../controllers/client/vocabularySet.controller");
const {
  createVocabularySetSchema,
  updateVocabularySetSchema,
} = require("../../validations/vocabularySet.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  requireAuth,
  validateBody(createVocabularySetSchema),
  vocabularySetController.createVocabularySet
);

router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateVocabularySetSchema),
  vocabularySetController.updateVocabularySet
);

router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  vocabularySetController.deleteVocabularySet
);

module.exports = router;
