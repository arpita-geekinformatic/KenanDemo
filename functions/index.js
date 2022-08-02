const functions = require("firebase-functions");
const express = require("express");
const moment = require("moment");
const bodyParser = require("body-parser");
const app = express();
const errorHanlder = require("./src/utils/GlobalErrorHandler");
const { checkAuthenticate } = require("./src/middleware/chechAuth")
const KenanUtilities = require("./src/utils/KenanUtilities");
const firebaseAdmin = require("./src/utils/firebase");
var multer = require('multer');
const parentController = require("./src/controller/parent");
const childController = require("./src/controller/child");
const response = require("./src/utils/response");
const fileUpload = require('express-fileupload');
// enable files upload
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "20mb" }));
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

app.get("/testing", (req, res) => {
  res.send("api working");
});


//   PARENT APP API   //
//  parent sign up  //
app.post("/signUp", async (req, res, next) => {
  try {
    let result = await parentController.signUp(res, req.body);
    return result;
  } catch (error) {
    next(error);
  }
});

//  parent account activation  //
app.post("/acountAcctivation", async (req, res, next) => {
  try{


  } catch (error){
    next(error)
  }
})




//  parent login   //
app.post("/login", async (req, res, next) => {
  try {
    let result = await parentController.login(res, req.body);
    return result;
  } catch (error) {
    next(error);
  }
});




//  Log out  //
app.post('/logout', async (req, res, next) => {
  try {
    let result = await parentController.logOut(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})



app.use(errorHanlder);
app.listen(3000, () => console.log(`server is running on ${3000}`));
exports.app = functions.https.onRequest(app);
