const { AppError } = require("../../../utils/appError");

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid request body";
    return next(new AppError(message, 400));
  }

  req.body = result.data;
  return next();
};

module.exports = { validateBody };
