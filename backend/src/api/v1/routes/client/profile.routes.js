const router = require("express").Router();
const profileController = require("../../controllers/client/profile.controller");
const { updateProfileSchema } = require("../../validations/profile.validation");
const { validateBody } = require("../../validations/validate");
const { verifyToken, requireAuth } = require("../../middlewares/auth.middleware");

router.use(verifyToken, requireAuth);

router.get("/me", profileController.getMe);

router.patch("/me", validateBody(updateProfileSchema), profileController.updateMe);

module.exports = router;
