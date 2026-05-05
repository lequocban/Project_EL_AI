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

// GET /api/v1/vocabulary-sets/my — Danh sách bộ từ vựng của user (phân trang, tìm kiếm)
router.get(
  "/my",
  verifyToken,
  requireAuth,
  vocabularySetController.getMyVocabularySets
);

// GET /api/v1/vocabulary-sets/public — Danh sách bộ từ vựng public (phân trang, tìm kiếm)
router.get(
  "/public",
  verifyToken,
  requireAuth,
  vocabularySetController.getPublicVocabularySets
);

module.exports = router;
