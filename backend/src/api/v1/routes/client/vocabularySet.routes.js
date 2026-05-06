const router = require("express").Router();
const vocabularySetController = require("../../controllers/client/vocabularySet.controller");
const {
  createVocabularySetSchema,
  updateVocabularySetSchema,
  addWordsSchema,
  generateWordsSchema,
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

// GET /api/v1/vocabulary-sets/:id — Chi tiết bộ từ vựng kèm danh sách từ vựng
router.get(
  "/:id",
  verifyToken,
  requireAuth,
  vocabularySetController.getDetail
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

// POST /api/v1/vocabulary-sets/generate-words — Tạo bộ từ vựng mới rồi sinh từ bằng AI
router.post(
  "/generate-words",
  verifyToken,
  requireAuth,
  validateBody(generateWordsSchema),
  vocabularySetController.generateWords
);

// POST /api/v1/vocabulary-sets/:id/words — Thêm từ vào bộ từ vựng
router.post(
  "/:id/words",
  verifyToken,
  requireAuth,
  validateBody(addWordsSchema),
  vocabularySetController.addWords
);

module.exports = router;
