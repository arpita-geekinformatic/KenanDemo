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
const fileUpload = require('express-fileupload');
// enable files upload
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "20mb" }));
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const dotenv = require('dotenv');
dotenv.config();

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




//   CHILD APP API   //
//  add child device apps  //
app.post("/addDeviceApps", async (req, res, next) => {
  try {
    let result = await childController.addDeviceApps(res, req.body);
    return result;
  }

  // try {
  //   //  If device doesn't exists  // 
  //   if (isDeviceExists.empty) {
  //     console.log("747 ======  IF");
  //     //  Insert data in Devices   //
  //     let reqData = bodyData;
  //     reqData.sentUnlinkRequest = false;
  //     reqData.acceptedUnlinkRequest = false;
  //     reqData.unlinkRequestAcceptedRejectedById = "";
  //     reqData.unlinkRequestAcceptedRejectedByName = "";
  //     delete reqData.apps;
  //     let docRef = await db.collection("devices").add(reqData);
  //     let userCreatedRef = db.collection("devices").doc(docRef.id);
  //     let deviceResult = await userCreatedRef.get();
  //     firestoreDevicePathId = deviceResult._ref._path.segments[1];

  //     //  Insert data in Apps  //
  //     let appArr = req.body.apps;
  //     appArr.forEach(async (element) => {
  //       let appRes = await db.collection("apps").where("appName", "==", element.appName).limit(1).get();
  //       let firestoreAppId;

  //       if (appRes.empty) {
  //         console.log("APP ADD on IF");
  //         let appRef = await db.collection("apps").add({
  //           appName: element.appName,
  //           packageName: element.packageName,
  //           baseImage: element.baseImage
  //         });
  //         firestoreAppId = appRef.id;
  //       }
  //       else {
  //         console.log("APP UPDATE on IF");
  //         appRes.forEach(async (doc) => {
  //           firestoreAppId = doc.id;
  //           await db.collection("apps").doc(doc.id).update({ baseImage: element.baseImage, });
  //         })
  //       };

  //       //  Insert data in deviceapps  //
  //       let deviceAppList = await db.collection("deviceApps").where("firestore_deviceId", "==", firestoreDevicePathId).get();

  //       let deviceAppArr = [];
  //       let firestore_deviceAppId;
  //       deviceAppList.forEach(doc => {
  //         if (doc.data().firestore_appId == firestoreAppId) {
  //           firestore_deviceAppId = doc.id
  //           deviceAppArr.push(doc.data())
  //         }
  //       })

  //       if (deviceAppArr.length > 0) {
  //         console.log("Device App UPDATE on ELSE");
  //         let deviceAppData = {
  //           appName: deviceAppArr[0].appName ? deviceAppArr[0].appName : element.appName,
  //           packageName: deviceAppArr[0].packageName ? deviceAppArr[0].packageName : element.packageName,
  //           firestore_appId: firestoreAppId,
  //           deviceId: deviceAppArr[0].deviceId ? deviceAppArr[0].deviceId : req.body.deviceId,
  //           status: element.status ? element.status : deviceAppArr[0].status ? deviceAppArr[0].status : 3,
  //           firestore_deviceId: firestoreDevicePathId,
  //           no_ofLaunches: deviceAppArr[0].no_ofLaunches ? deviceAppArr[0].no_ofLaunches : element.noOfLaunches,
  //           phoneTimeLimit: deviceAppArr[0].phoneTimeLimit ? deviceAppArr[0].phoneTimeLimit : element.phoneTimeLimit,
  //           dailyTimeLimit: deviceAppArr[0].dailyTimeLimit ? deviceAppArr[0].dailyTimeLimit : element.individualAppTimeLimit,
  //           spendTime: deviceAppArr[0].spendTime ? deviceAppArr[0].spendTime : element.timeSpent,
  //           usageTimeOnDays: deviceAppArr[0].usageTimeOnDays ? deviceAppArr[0].usageTimeOnDays : element.usageTimeOnDays,
  //         }
  //         await db.collection("deviceApps").doc(firestore_deviceAppId).update(deviceAppData);
  //       }
  //       else {
  //         console.log("Device App ADD on ELSE");
  //         let deviceAppRef = await db.collection("deviceApps").add({
  //           appName: element.appName || '',
  //           packageName: element.packageName || '',
  //           firestore_appId: firestoreAppId,
  //           deviceId: req.body.deviceId,
  //           status: element.status || 3,
  //           firestore_deviceId: firestoreDevicePathId,
  //           no_ofLaunches: element.noOfLaunches || 0,
  //           phoneTimeLimit: element.phoneTimeLimit || 1800,
  //           dailyTimeLimit: element.individualAppTimeLimit || 0,
  //           spendTime: element.timeSpent || 0,
  //           usageTimeOnDays: element.usageTimeOnDays || '',
  //         });
  //       }
  //     });
  //   }
  //   else {
  //     //  If device already exists  //
  //     console.log("**********  ELSE");
  //     isDeviceExists.forEach(doc => {
  //       firestoreDevicePathId = doc.id;
  //     })
  //     let newData = {
  //       fcmToken: bodyData.fcmToken,
  //     }
  //     await db.collection("devices").doc(firestoreDevicePathId).update(newData);

  //     //  Insert new Apps  //
  //     let appArr = req.body.apps;
  //     appArr.forEach(async (element) => {
  //       let appRes = await db.collection("apps").where("appName", "==", element.appName).limit(1).get();
  //       let firestoreAppId;

  //       if (appRes.empty) {
  //         console.log("APP ADD on ELSE");
  //         let appRef = await db.collection("apps").add({
  //           appName: element.appName,
  //           packageName: element.packageName,
  //           baseImage: element.baseImage
  //         });
  //         firestoreAppId = appRef.id;
  //       }
  //       else {
  //         console.log("APP UPDATE on ELSE");
  //         appRes.forEach(async (doc) => {
  //           firestoreAppId = doc.id;
  //           await db.collection("apps").doc(doc.id).update({ baseImage: element.baseImage, });
  //         })
  //       };

  //       //  Insert data in deviceapps  //
  //       let deviceAppList = await db.collection("deviceApps").where("firestore_deviceId", "==", firestoreDevicePathId).get();

  //       let deviceAppArr = [];
  //       let firestore_deviceAppId;
  //       deviceAppList.forEach(doc => {
  //         if (doc.data().firestore_appId == firestoreAppId) {
  //           firestore_deviceAppId = doc.id
  //           deviceAppArr.push(doc.data())
  //         }
  //       })

  //       if (deviceAppArr.length > 0) {
  //         console.log("Device App UPDATE on ELSE");
  //         let deviceAppData = {
  //           appName: deviceAppArr[0].appName ? deviceAppArr[0].appName : element.appName,
  //           packageName: deviceAppArr[0].packageName ? deviceAppArr[0].packageName : element.packageName,
  //           firestore_appId: firestoreAppId,
  //           deviceId: deviceAppArr[0].deviceId ? deviceAppArr[0].deviceId : req.body.deviceId,
  //           status: element.status ? element.status : deviceAppArr[0].status ? deviceAppArr[0].status : 3,
  //           firestore_deviceId: firestoreDevicePathId,
  //           no_ofLaunches: deviceAppArr[0].no_ofLaunches ? deviceAppArr[0].no_ofLaunches : element.noOfLaunches,
  //           phoneTimeLimit: deviceAppArr[0].phoneTimeLimit ? deviceAppArr[0].phoneTimeLimit : element.phoneTimeLimit,
  //           dailyTimeLimit: deviceAppArr[0].dailyTimeLimit ? deviceAppArr[0].dailyTimeLimit : element.individualAppTimeLimit,
  //           spendTime: deviceAppArr[0].spendTime ? deviceAppArr[0].spendTime : element.timeSpent,
  //           usageTimeOnDays: deviceAppArr[0].usageTimeOnDays ? deviceAppArr[0].usageTimeOnDays : element.usageTimeOnDays,
  //         }
  //         await db.collection("deviceApps").doc(firestore_deviceAppId).update(deviceAppData);
  //       }
  //       else {
  //         console.log("Device App ADD on ELSE");

  //         let deviceAppRef = await db.collection("deviceApps").add({
  //           appName: element.appName || '',
  //           packageName: element.packageName || '',
  //           firestore_appId: firestoreAppId,
  //           deviceId: req.body.deviceId,
  //           status: element.status || 3,
  //           firestore_deviceId: firestoreDevicePathId,
  //           no_ofLaunches: element.noOfLaunches || 0,
  //           phoneTimeLimit: element.phoneTimeLimit || 1800,
  //           dailyTimeLimit: element.individualAppTimeLimit || 0,
  //           spendTime: element.timeSpent || 0,
  //           usageTimeOnDays: element.usageTimeOnDays || '',
  //         });
  //       }
  //     });
  //   }

  //   return res.send({ responseCode: 200, status: true, message: "success", deviceId: firestoreDevicePathId });
  // }
  catch (error) {
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
