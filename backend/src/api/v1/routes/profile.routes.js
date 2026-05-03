const router = require("express").Router();
const profileController = require("../controllers/profile.controller");
const { updateProfileSchema } = require("../validations/profile.validation");
const { validateBody } = require("../validations/validate");
const { verifyToken, requireAuth } = require("../middlewares/auth.middleware");

// Tất cả route profile đều yêu cầu đăng nhập
router.use(verifyToken, requireAuth);

// GET /api/v1/profile/me — Xem hồ sơ cá nhân
router.get("/me", profileController.getMe);

// PATCH /api/v1/profile/me — Cập nhật một phần hồ sơ cá nhân (trừ mật khẩu)
router.patch("/me", validateBody(updateProfileSchema), profileController.updateMe);

module.exports = router;
