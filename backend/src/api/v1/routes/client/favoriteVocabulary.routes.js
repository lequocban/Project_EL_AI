const router = require("express").Router();
const favoriteVocabularyController = require("../../controllers/client/favoriteVocabulary.controller");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.use(verifyToken, requireAuth);

// POST /api/v1/favorites/vocabulary-sets — Thêm bộ từ vựng vào yêu thích
router.post("/vocabulary-sets/:id", favoriteVocabularyController.addFavorite);

// DELETE /api/v1/favorites/vocabulary-sets/:id — Xóa bộ từ vựng khỏi yêu thích
router.delete("/vocabulary-sets/:id", favoriteVocabularyController.removeFavorite);

// GET /api/v1/favorites/vocabulary-sets — Danh sách bộ từ vựng yêu thích (phân trang, tìm kiếm)
router.get("/vocabulary-sets", favoriteVocabularyController.getFavorites);

module.exports = router;
