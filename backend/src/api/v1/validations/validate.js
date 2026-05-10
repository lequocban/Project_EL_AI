const { AppError } = require("../../../utils/appError");

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));

    const err = new AppError("Dữ liệu không hợp lệ", 400);
    err.errors = errors;
    return next(err);
  }

  req.body = result.data;
  return next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "query",
      message: issue.message,
    }));

    const err = new AppError("Tham số truy vấn không hợp lệ", 400);
    err.errors = errors;
    return next(err);
  }

  req.query = result.data;
  return next();
};

module.exports = { validateBody, validateQuery };
