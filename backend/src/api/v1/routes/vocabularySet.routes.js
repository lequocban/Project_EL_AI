const router = require("express").Router();
const vocabularySetController = require("../controllers/vocabularySet.controller");
const {
  createVocabularySetSchema,
  updateVocabularySetSchema,
} = require("../validations/vocabularySet.validation");
const { validateBody } = require("../validations/validate");
const { verifyToken, requireAuth } = require("../middlewares/auth.middleware");

// POST /api/v1/vocabulary-sets — Tạo mới bộ từ vựng
router.post(
  "/",
  verifyToken,
  requireAuth,
  validateBody(createVocabularySetSchema),
  vocabularySetController.createVocabularySet
);

// PATCH /api/v1/vocabulary-sets/:id — Cập nhật bộ từ vựng
router.patch(
  "/:id",
  verifyToken,
  requireAuth,
  validateBody(updateVocabularySetSchema),
  vocabularySetController.updateVocabularySet
);

// DELETE /api/v1/vocabulary-sets/:id — Xóa mềm bộ từ vựng
router.delete(
  "/:id",
  verifyToken,
  requireAuth,
  vocabularySetController.deleteVocabularySet
);

module.exports = router;
