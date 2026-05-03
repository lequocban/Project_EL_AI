const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");
const { validateBody } = require("../validations/validate");

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

module.exports = router;
