const authService = require("../services/auth.service");
const { success } = require("../../../utils/responseHandler");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, result, "Register success", 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result, "Login success");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
