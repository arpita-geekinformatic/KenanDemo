const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//  const { JWT_SECRET, JWT_EXPIRE_TIME } = process.env;
const JWT_SECRET = "d2h4b2h59fb32b54jnfnsh";
const SALT = 10;
const qr = require('qrcode');

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

//  generate child auth token  //
const generateChildToken = (childId, deviceId) => {
  try {
    const payload = {
      childId: childId,
      deviceId: deviceId,
    };
    const token = JWT.sign(payload, JWT_SECRET, {});

    return token;
  } catch (error) {
    return error;
  }
}

//  generateAdminToken  //
const generateAdminToken = (name, email, id) =>{
  try {
    const payload = {
      name: name,
      email: email,
      id: id,
    };
    const token = JWT.sign(payload, JWT_SECRET, {});

    return token;
  } catch (error) {
    return error;
  }
}

//  decrypt auth token //
const decryptToken = (token) => {
  try {
    const decodedToken = JWT.verify(token, JWT_SECRET);
    return decodedToken;
  } catch (err) {
    return false;
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
  try {
    const passwordMatch = bcrypt.compare(password, hash);
    return passwordMatch;
  } catch (error) {
    return error;
  }
};

//  OTP generate  //
const genNumericCode = (length) => {
  try {
    let min = Math.pow(10, length - 1);
    let max = (Math.pow(10, length) - Math.pow(10, length - 1) - 1);
    let newOTP = Math.floor(min + Math.random() * max);
    return newOTP;
  } catch (error) {
    return error;
  }
}







module.exports = {
  generateToken,
  generateChildToken,
  generateAdminToken,
  decryptToken,
  mapToValues,
  cryptPassword,
  VerifyPassword,
  genNumericCode,
};
