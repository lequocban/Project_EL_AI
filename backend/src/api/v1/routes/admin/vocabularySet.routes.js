const router = require("express").Router();
const vocabularySetController = require("../../controllers/admin/vocabularySet.controller");
const { verifyToken, requireAuth, requireManagerOrAdmin } = require("../../middlewares/auth.middleware");

// GET /api/v1/admin/vocabulary-sets/pending — Danh sách bộ từ vựng chờ duyệt
router.get(
  "/pending",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  vocabularySetController.getPendingPublicSets
);

// POST /api/v1/admin/vocabulary-sets/:id/approve — Duyệt public bộ từ vựng
router.post(
  "/:id/approve",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  vocabularySetController.approvePublic
);

// POST /api/v1/admin/vocabulary-sets/:id/reject — Từ chối duyệt bộ từ vựng
router.post(
  "/:id/reject",
  verifyToken,
  requireAuth,
  requireManagerOrAdmin,
  vocabularySetController.rejectPublic
);

module.exports = router;
