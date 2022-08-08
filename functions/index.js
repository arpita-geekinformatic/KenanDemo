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
const adminController = require("./src/controller/admin");
const parentController = require("./src/controller/parent");
const childController = require("./src/controller/child");
const response = require("./src/utils/response");
const cors = require("cors");


// //use multer for files parser (directory is public) 
// const upload = multer({ dest: 'temp/' });
// //key of files could be any
// app.use(upload.any());
// // to load files from public directory
// app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const fileUpload = require('express-fileupload');
// enable files upload
// app.use(fileUpload({ createParentPath: true }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json({ limit: "20mb" }));
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const dotenv = require('dotenv');
dotenv.config();


// // POST - Add Image to Cloud Storage
// app.post('/upload', async (req, res, next) => {
//   try {
//     // console.log("******* req.files : ", req.files, req.file);
//     // return response.data(res,req.files, 200, "data");

//     let result = await firebaseAdmin.fileUpload(res, req)
//     return result;
//   }
//   catch (error) {
//     next(error)
//   }
// });




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
app.get("/acountAcctivation/:activationLink", async (req, res, next) => {
  try {
    let result = await parentController.acountAcctivation(res, req.params.activationLink);
    return result;
  } catch (error) {
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

//  parent Log out  //
app.post('/logout', async (req, res, next) => {
  try {
    let result = await parentController.logOut(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  parent forgot password  //
app.post('/forgotPassword', async (req, res, next) => {
  try {
    let result = await parentController.forgotPassword(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  verify OTP  //
app.post('/verifyOTP', async (req, res, next) => {
  try {
    let result = await parentController.verifyOTP(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  resend OTP  //
app.post('/resendOTP', async (req, res, next) => {
  try {
    let result = await parentController.resendOTP(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  new password  //
app.post('/newPassword', async (req, res, next) => {
  try {
    let result = await parentController.newPassword(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  reset Password  //
app.post('/resetPassword', async (req, res, next) => {
  try {
    let result = await parentController.resetPassword(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  add Child  //
app.post('/addChild', async (req, res, next) => {
  try {
    let result = await parentController.addChild(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  child list  //
app.post('/childList', async (req, res, next) => {
  try {
    let result = await parentController.childList(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  delete child by Id  //
app.post('/deleteChild/:id', async (req, res, next) => {
  try {
    let result = await parentController.deleteChild(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  get child by id (for parent)   //
app.post('/getChildByParent/:id', async (req, res, next) => {
  try {
    let result = await parentController.getChildByParent(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error);
  }
});

//  child Device App List //
app.post('/childDeviceAppList', async (req, res, next) => {
  try {
    let result = await parentController.childDeviceAppList(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
});





//   CHILD APP API   //
//  add child device apps  //
app.post("/addDeviceApps", async (req, res, next) => {
  try {
    let result = await childController.addDeviceApps(res, req.body);
    return result;
  } catch (error) {
    next(error);
  }
});

//  scan QR code  //
app.post("/scanQrCode", async (req, res, next) => {
  try {
    let result = await childController.scanQrCode(res, req.body);
    return result;
  } catch (error) {
    next(error);
  }
});



//   ADMIN API   //
//  create admin  //
app.post('/createAdmin', async (req, res, next) => {
  try {
    let result = await adminController.createAdmin(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})



app.use(errorHanlder);
app.listen(3000, () => console.log(`server is running on ${3000}`));
exports.app = functions.https.onRequest(app);
