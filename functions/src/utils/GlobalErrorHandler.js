const responseHelper = require("./response");

const errorCode = (error) => {
  console.log("myerrorname", error);
  let code = 400;
  switch (error.name) {
    case "ValidationError":
      code = 422;
      break;
    case "Server Error":
      code = 500;
      break;
    case "JsonWebTokenError":
    case "unauthorized":
      code = 401;
      break;
    case "Not Found":
      code = 404;
      break;
    default:
  }
  return code;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const code = errorCode(error);
  responseHelper.failure(res, error, code);
};

module.exports = errorHandler;
