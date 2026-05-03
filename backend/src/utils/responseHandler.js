const success = (res, data, message = "OK", status = 200) => {
  return res.status(status).json({
    code: status,
    success: true,
    message,
    data,
  });
};

const fail = (res, message = "Bad Request", status = 400) => {
  return res.status(status).json({
    code: status,
    success: false,
    message,
  });
};

module.exports = {
  success,
  fail,
};
