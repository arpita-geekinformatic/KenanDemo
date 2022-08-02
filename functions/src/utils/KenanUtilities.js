const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//  const { JWT_SECRET, JWT_EXPIRE_TIME } = process.env;
const JWT_SECRET = "d2h4b2h59fb32b54jnfnsh";
const SALT = 10;

//  generate auth token  //
const generateToken = (email, id) => {
  try {
    const payload = {
      email: email,
      id: id,
    };
    const token = JWT.sign(payload, JWT_SECRET, {});

    return token;
  } catch (error) {
    return error;
  }
};

//  decrypt auth token //
const decryptToken = (token) => {
  try {
    const decodedToken = JWT.verify(token, JWT_SECRET);
    return decodedToken;
  } catch (err) {
    return err;
  }
};

const mapToValues = (keys, body) => {
  let finalArr = {};
  keys.forEach((item) => {
    if (body.hasOwnProperty(item)) {
      finalArr[item] = body[item];
    } else {
      finalArr[item] = ""
    }
  });
  return finalArr;
}

//  Generate encrypted password  //
const cryptPassword = async (password) => {
  try {
    const hashedPassword = bcrypt.hash(password, SALT);
    return hashedPassword;
  } catch (error) {
    return error;
  }
};

//  Verify password  //
const VerifyPassword = async (password, hash) => {
  try{
    const passwordMatch =  bcrypt.compare(password, hash);
    return passwordMatch;
  } catch (error) {
    return error;
  }
};

module.exports = {
  generateToken,
  decryptToken,
  mapToValues,
  cryptPassword,
  VerifyPassword,
};
