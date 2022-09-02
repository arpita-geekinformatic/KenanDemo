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
const cronController = require("./src/controller/cron");
const response = require("./src/utils/response");
const cors = require("cors");
let os = require('os');
const fs = require('fs');
var Buffer = require('buffer/').Buffer;
const ejs = require("ejs");
const cron = require('node-cron');

// const upload = multer({ dest: os.tmpdir() + `/`});
// app.use(upload.any());
// app.use(express.static('public'));
// const fileUpload = require('express-fileupload');
// enable files upload
// app.use(fileUpload({ createParentPath: true }));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(cors({ origin: '*' }));
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const dotenv = require('dotenv');
dotenv.config();
const MailerUtilities = require("./src/utils/MailerUtilities");
const message = require("./src/utils/message");




app.get("/testing", (req, res) => {
  res.send("api working");
});


//   PARENT APP API   //
//  parent sign up  //
app.post("/signUp", async (req, res, next) => {
  try {
    let result = await parentController.signUp(res, req.body, req.headers);
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
    let result = await parentController.login(res, req.body, req.headers);
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
    let result = await parentController.forgotPassword(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  verify OTP  //
app.post('/verifyOTP', async (req, res, next) => {
  try {
    let result = await parentController.verifyOTP(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  resend OTP  //
app.post('/resendOTP', async (req, res, next) => {
  try {
    let result = await parentController.resendOTP(res, req.body, req.headers);
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

//  get profile details  //
app.post('/getParentProfile', async (req, res, next) => {
  try {
    let result = await parentController.getParentProfile(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  update parent profile //
app.post('/updateParentProfile', async (req, res, next) => {
  try {
    let result = await parentController.updateParentProfile(res, req.headers, req.body);
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

//  add app usage for child device  //
app.post('/addAppUsage', async (req, res, next) => {
  try {
    let result = await parentController.addAppUsage(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
});

//  gift type dropdown  //
app.post('/giftTypeDropdown', async (req, res, next) => {
  try {
    let result = await parentController.giftTypeDropdown(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  add gift to child  //
app.post('/addGift', async (req, res, next) => {
  try {
    let result = await parentController.addGift(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
});

//  child gift list by Id  //
app.post('/childGiftList', async (req, res, next) => {
  try {
    let result = await parentController.childGiftList(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
});

//  delete child gift data by Id  //
app.post('/deleteChildGiftById/:id', async (req, res, next) => {
  try {
    let result = await parentController.deleteChildGiftById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
});

//  notification list //
app.post('/parentNotificationList', async (req, res, next) => {
  try {
    let result = await parentController.parentNotificationList(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  all notification delete  //
app.post('/allParentNotificationDelete', async (req, res, next) => {
  try {
    let result = await parentController.allParentNotificationDelete(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  notification delete by ID  //
app.post('/parentNotificationDelete/:id', async (req, res, next) => {
  try {
    let result = await parentController.notificationDeleteById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  accept/reject gift request from child by Id  //
app.post('/acceptRejectGiftRequest/:id', async (req, res, next) => {
  try {
    let result = await parentController.acceptRejectGiftRequest(res, req.headers, req.params, req.query);
    return result;
  } catch (error) {
    next(error)
  }
})





//   CHILD APP API   //
//  scan QR code  //
app.post("/scanQrCode", async (req, res, next) => {
  try {
    let result = await childController.scanQrCode(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error);
  }
});

//  add child device apps  //
app.post("/addDeviceApps", async (req, res, next) => {
  try {
    let result = await childController.addDeviceApps(res, req.body, req.headers);
    return result;
  } catch (error) {
    next(error);
  }
});

//  get chils details by Id //
app.post("/childDetails", async (req, res, next) => {
  try {
    let result = await childController.childDetails(res, req.headers);
    return result;
  } catch (error) {
    next(error);
  }
});

//  child Device App List for child  //
app.post('/deviceAppListByChild', async (req, res, next) => {
  try {
    let result = await childController.deviceAppListByChild(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
});

//  update child device and app usage  //
app.post('/updateUsageTime', async (req, res, next) => {
  try {
    let result = await childController.updateUsageTime(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
});

//  notification list //
app.post('/childNotificationList', async (req, res, next) => {
  try {
    let result = await childController.childNotificationList(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  notification delete by ID  //
app.post('/childNotificationDelete/:id', async (req, res, next) => {
  try {
    let result = await childController.notificationDeleteById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  all notification delete  //
app.post('/allChildNotificationDelete', async (req, res, next) => {
  try {
    let result = await childController.allChildNotificationDelete(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  all gift list  //
app.post('/giftListChild', async (req, res, next) => {
  try {
    let result = await childController.giftList(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  Redeem gift by id  //
app.post('/redeemGift/:id', async (req, res, next) => {
  try {
    let result = await childController.redeemGift(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})




//   COMMON API  //
//  upload image to firebase storage and get public url  //
app.post('/upload', async (req, res, next) => {
  try {

    let bufferData = Buffer.from(req.body.data, "base64")
    let path = `/` + Date.now() + `.png`;
    await fs.createWriteStream(os.tmpdir() + path).write(bufferData);

    //  get file path from temp folder  //
    let filePath = (os.tmpdir() + path);
    let uploadFile = await firebaseAdmin.uploadFile(filePath);
    let data = { url: uploadFile }

    return response.data(res, data, 200, message.SUCCESS);
  } catch (error) {
    next(error);
  }
})

//  cron to reset time spent of all device at midnight  //
// cron.schedule('0 0 * * *', () => {
//   console.log("431 ==========  Cron job every night at midnight =========");
//   // notifyUserForUpcomingChecklist();
// });

// cron.schedule('0 0 0 * * *', () => {
//   console.log("436 ++++++++++  Cron job every night at midnight ++++++++++");
//   // notifyUserForUpcomingChecklist();
// });

// cron.schedule('* * * * *', async () => {
//   console.log('>>>>>>>>>>>>>>> running a task every minute');

//   try {
//     let result = await cronController.resetTimeSpent(res);
//     return result;
//   } catch (error) {
//     next(error)
//   }

// });


app.get('/resetTimeSpent', async (req, res, next) => {
  try {
    let result = await cronController.resetTimeSpent(res);
    return result;
  } catch (error) {
    next(error)
  }
})

//  refresh fcm token (For both Parent & Children)  //
// app.post('/refreshFcmToken', async (req, res, next) => {
//   try { 
//     if (!req.body.userType) { //  userType : 1 ==> Parent,  userType : 2 ==> Child    
//       return response.failure(res, 400, message.TYPE_REQUIRED);
//     }

//     //  for parent  //
//     if (req.body.userType == 1) {
//       console.log("*********  refresh parent Fcm Token *********");
//       const result = await parentController.refreshFcmToken(res, req.body);
//       return result;
//     }
//     if (req.body.userType == 2) {
//       //  for child  //
//       console.log("========  refresh child Fcm Token  ========");
//       const result = await childController.refreshFcmToken(res, req.body);
//       return result;
//     }
//   } catch (error) {
//     next(error)
//   }
// });






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

//  login admin  //
app.post('/adminLogin', async (req, res, next) => {
  try {
    let result = await adminController.adminLogin(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  logout admin  //
app.post('/adminLogout', async (req, res, next) => {
  try {
    let result = await adminController.adminLogout(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  forgot password  //
app.post('/auth/forgotPassword', async (req, res, next) => {
  try {
    let result = await adminController.forgotPassword(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

// parent list  //
app.get('/userList', async (req, res, next) => {
  try {
    let result = await adminController.userList(res, req.headers, req.query);
    return result;
  } catch (error) {
    next(error)
  }
})

//  get parent details by ID //
app.get('/parents/:id', async (req, res, next) => {
  try {
    let result = await adminController.parentDetails(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  update parent details by ID  //
app.put('/parents', async (req, res, next) => {
  try {
    let result = await adminController.updateParent(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  delete parent details by ID  //
app.delete('/parents/:id', async (req, res, next) => {
  try {
    let result = await adminController.deleteParent(res, req.headers, req.params);
    return result;

  } catch (error) {
    next(error)
  }
})

//  child list by parent ID  //
app.get('/parentChildList/:id', async (req, res, next) => {
  try {
    let result = await adminController.parentChildList(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  all child list  //
app.get('/allChildList', async (req, res, next) => {
  try {
    let result = await adminController.allChildList(res, req.headers, req.query);
    return result;
  } catch (error) {
    next(error)
  }
})

//  child details by Id  //
app.get('/child/:id', async (req, res, next) => {
  try {
    let result = await adminController.childDetailsById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  child delete by ID  //
app.delete('/childDelete/:id', async (req, res, next) => {
  try {
    let result = await adminController.childDeleteById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  add gift type for parent  //
app.post('/addGiftType', async (req, res, next) => {
  try {
    let result = await adminController.addGiftType(res, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  gift type list  //
app.get('/giftTypeList', async (req, res, next) => {
  try {
    let result = await adminController.giftTypeList(res, req.headers, req.query);
    return result;
  } catch (error) {
    next(error)
  }
})

//  update gift type by Id  //
app.post('/updateGiftType/:id', async (req, res, next) => {
  try {
    let result = await adminController.updateGiftTypeById(res, req.headers, req.params, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})

//  view gift type by Id  //
app.get('/viewGiftType/:id', async (req, res, next) => {
  try {
    let result = await adminController.viewGiftTypeById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  delete gift type by Id  //
app.delete('/deleteGiftType/:id', async (req, res, next) => {
  try {
    let result = await adminController.deleteGiftTypeById(res, req.headers, req.params);
    return result;
  } catch (error) {
    next(error)
  }
})

//  dashboard data  //
app.get('/dashboard', async(req, res, next) => {
  try {
    let result = await adminController.dashboard(res, req.headers);
    return result;
  } catch (error) {
    next(error)
  }
})

//  add/update settings  //
app.post('/settings', async (req, res, next) => {
  try {
    let result = await adminController.settings(res, req.headers, req.body);
    return result;
  } catch (error) {
    next(error)
  }
})






app.use(errorHanlder);
app.listen(3000, () => console.log(`server is running on ${3000}`));
exports.app = functions.https.onRequest(app);



// exports.myPubSubFunction = functions.pubsub.schedule('* * * * *').onRun(() => {
//   console.log('Hello World');
//   return 
// })