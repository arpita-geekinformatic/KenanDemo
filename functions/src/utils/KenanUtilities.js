const JWT = require("jsonwebtoken");
//  const { JWT_SECRET, JWT_EXPIRE_TIME } = process.env;
const JWT_SECRET = "d2h4b2h59fb32b54jnfnsh";

const generateToken = (name,uid,email) => {
  try {
    const payload = {
      name: name,
      email: email,
      id: uid,
    };
    const token = JWT.sign(payload, JWT_SECRET, {});

    return token;
  } catch (error) {
    return error;
  }
};

const decryptToken = (token) => {
  try {
    const decodedToken = JWT.verify(token, JWT_SECRET);
    return decodedToken;
  } catch (err) {
    return err;
  }
};

const mapToValues = (keys,body) =>{
  let finalArr = {}; 
  keys.forEach((item)=>{
      if(body.hasOwnProperty(item)){
        finalArr[item] = body[item];        
      }else{
        finalArr[item] = ""
      }
  });
  return finalArr;
}

module.exports = {
  generateToken,
  decryptToken,
  mapToValues
};
