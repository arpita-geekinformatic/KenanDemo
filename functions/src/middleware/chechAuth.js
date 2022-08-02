const jwtHelper = require("../utils/KenanUtilities");
const errorMessages = require("../utils/message");

const checkAuthenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      throw Error(errorMessages.TOKEN_REQUIRED);
    }

    const userDetails = jwtHelper.decryptToken(token);
    if (userDetails.message) {
      throw Error(errorMessages.TOKEN_EXPIRED);
    }

    next();
  } catch (err) {
    next(err);
  }
};
module.exports = {
  checkAuthenticate,
};
