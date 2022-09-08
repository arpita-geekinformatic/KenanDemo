const adminService = require("../services/adminService");
const response = require("../utils/response");
const message = require("../utils/message");
const firebaseAdmin = require("../utils/firebase");
const notificationData = require("../services/notification");
const { service } = require("firebase-functions/v1/analytics");
const KenanUtilities = require("../utils/KenanUtilities");
const MailerUtilities = require("../utils/MailerUtilities");
const ejs = require("ejs");
const dotenv = require('dotenv');
dotenv.config();
const moment = require("moment");



//  create Admin  //
const createAdmin = async (res, bodyData) => {
  try {
    let password = await KenanUtilities.cryptPassword("Qwerty@1");
    let adminRes = await adminService.findAdmin();

    if (!adminRes) {
      let adminData = {
        fullName: "Admin",
        email: "admin@yopmail.com",
        password: password,
        isDeleted: false,
        role: 'Admin'
      }

      let createAdminProfile = await adminService.createAdminProfile(adminData);
      return response.success(res, 200, message.SUCCESS);
    }
    else {
      return response.success(res, 200, message.USER_EXISTS);
    }

  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  admin login  //
const adminLogin = async (res, bodyData) => {
  try {
    if (!bodyData.email) {
      return response.failure(res, 400, message.EMAIL_REQUIRED);
    }
    if (!bodyData.password) {
      return response.failure(res, 400, message.PASSWORD_REQUIRED);
    }

    const adminData = await adminService.findAdmin(bodyData.email);
    if (!adminData) {
      return response.failure(res, 400, message.USER_NOT_FOUND,);
    }

    const match = await KenanUtilities.VerifyPassword(bodyData.password, adminData.password);
    if (!match) {
      return response.failure(res, 400, message.INVALID_PASSWORD);
    }

    const authToken = await KenanUtilities.generateAdminToken(adminData.fullName, adminData.email, adminData.adminId);
    adminData.authToken = authToken;
    let newData = {
      email: adminData.email,
      authToken: authToken,
    }
    const updateAdminData = await adminService.updateAdmin(adminData.adminId, newData);

    return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data: newData });

  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  admin logout  //
const adminLogout = async (res, headers) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    let updatedData = {
      authToken: ""
    }
    let updateAdmin = await adminService.updateAdmin(adminData.adminId, updatedData)

    return response.success(res, 200, message.LOGOUT)
  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  forgot Password  //
const forgotPassword = async (res, bodyData) => {
  try {
    if (!bodyData.email) {
      return response.failure(res, 400, message.EMAIL_REQUIRED);
    }

    const adminData = await adminService.findAdmin(bodyData.email);
    if (!adminData) {
      return response.failure(res, 400, message.USER_NOT_FOUND,);
    }

    let randomOTP = KenanUtilities.genNumericCode(4);
    let expiredDate = moment().add(10, 'm');
    let newData = {
      otp: randomOTP,
      otpVerified: false,
      otpExipredAt: `${expiredDate}`
    }

    //  Get email template to send email 
    let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/english/otpEmail.ejs", { otp: randomOTP }, { async: true });
    let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Forgot Password", text: messageHtml });

    let updateAdminData = await adminService.updateAdmin(adminData.adminId, newData)
    return response.success(res, 200, message.SUCCESS);

  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  user List  //
const userList = async (res, headers, queryData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    let limit = queryData.limit ? parseInt(queryData.limit) : 10;
    let offset = queryData.skip ? parseInt(queryData.skip) : 0;
    // let offset = queryData.page ? parseInt(queryData.page) * limit : 0;

    let userList = await adminService.userList(limit, offset);
    let totalUser = await adminService.totalUserCount();
    let data = {
      totalItems: totalUser,
      userList: userList
    }

    return response.data(res, data, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  parent Details by ID  //
const parentDetails = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.USER_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const parentDetails = await adminService.parentdetailsById(paramData.id);
    if (!parentDetails) {
      return response.failure(res, 400, message.USER_NOT_FOUND);
    }

    return response.data(res, parentDetails, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  add Parent  //
const addParent = async (res, headers, bodyData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!bodyData.email) {
      return response.failure(res, 200, message.EMAIL_REQUIRED);
    }
    if (!bodyData.password) {
      return response.failure(res, 200, message.PASSWORD_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    let isParentExists = await adminService.isParentExists(bodyData.email);
    if (isParentExists) {
      return response.failure(res, 200, message.USER_EXISTS);
    }
    let hashedPassword = await KenanUtilities.cryptPassword(bodyData.password);

    let newData = {
      name: bodyData.name || "",
      email: bodyData.email || "",
      password: hashedPassword,
      isActive: false,
      isDeleted: false,
      isBlocked: false,
      authToken: "",
      fcmToken: bodyData.fcmToken || "",
      childId: [],
      photo: bodyData.photo || '',
    }
    let createParentProfile = await adminService.createParentProfile(newData);

    //  create activation link
    let activationLink = process.env.BASE_URL + "acountAcctivation/" + createParentProfile;
    console.log("********** activationLink : ", activationLink);

    //  Get email template to send email in ENGLISH     { data: rows,pageTitle: "Edit Agents" }
    let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/accountCreateEmail.ejs", { link: activationLink, password: bodyData.password }, { async: true });

    let mailResponse = await MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Account Activation", text: messageHtml });
    console.log("51  >>>>>>  mailResponse : ", mailResponse);

    return response.success(res, 200, message.ACTIVATION_MAIL_SENT);
  } catch (error) {
    return response.failure(res, 400, error);
  }
}



//  update Parent Details by ID  //
const updateParent = async (res, headers, bodyData, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.USER_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const parentDetails = await adminService.parentdetailsById(paramData.id);
    if (!parentDetails) {
      return response.failure(res, 400, message.USER_NOT_FOUND);
    }

    let updatedData = {
      name: bodyData.name || parentDetails.name,
      photo: bodyData.photo || parentDetails.photo,
      // isActive: bodyData.status ? ((bodyData.status == 'active') ? true : false) : parentDetails.isActive
    }

    let updateParentById = await adminService.updateParentById(paramData.id, updatedData)
    return response.success(res, 200, message.SUCCESS);

  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  delete Parent details by ID  //
const deleteParent = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.USER_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const parentDetails = await adminService.parentdetailsById(paramData.id);
    if (!parentDetails) {
      return response.failure(res, 400, message.USER_NOT_FOUND);
    }

    let updatedParentData = {
      childId: [],
      isDeleted: true,
      fcmToken: ''
    }
    let updateParentById = await adminService.updateParentById(paramData.id, updatedParentData)

    const childListByParentId = await adminService.deleteChildsByParentsId(paramData.id);

    let connectdChildList = await childListByParentId.filter(child => { return (child.deviceId != '') });

    let allChildEmailArr = [parentDetails.email];
    let allChildDeviceIdArr = [];
    for (let child of connectdChildList) {
      allChildEmailArr.push(child.email);
      allChildDeviceIdArr.push(child.deviceId)
    }
    //  remove chield ID and parent Id from devices  //
    let deleteConnectedChildDevice = await adminService.deleteConnectedChildDevice(allChildDeviceIdArr);

    //  send mail to parent and all connected child  //
    let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/accountDeleteEmail.ejs", { async: true });
    let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: allChildEmailArr, subject: "Kenan Account", text: messageHtml });

    return response.success(res, 200, message.SUCCESS);
  } catch (error) {
    return response.failure(res, 400, error);
  }
}

//  parent Child List by ID  //
const parentChildList = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.PARENT_ID_REQUIRED,);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const parentData = await adminService.parentdetailsById(paramData.id)
    if (!parentData) {
      return response.failure(res, 400, message.INVALID_PARENT_ID,);
    }

    const childList = await adminService.childListByParentId(paramData.id)



    return response.data(res, childList, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  all Child List  //
const allChildList = async (res, headers, queryData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    let limit = queryData.limit ? parseInt(queryData.limit) : 10;
    let offset = queryData.skip ? parseInt(queryData.skip) : 0;

    const allChildList = await adminService.allChildList(limit, offset);
    const totalChildCount = await adminService.totalChildCount()

    let data = {
      totalItems: totalChildCount,
      userList: allChildList
    }
    return response.data(res, data, 200, message.SUCCESS)

  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  child Details By Id  //
const childDetailsById = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.CHILD_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const childDetails = await adminService.childDetailsById(paramData.id);
    if (!childDetails) {
      return response.failure(res, 400, message.INVALID_CHILD_ID,);
    }

    return response.data(res, childDetails, 200, message.SUCCESS)

  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  child Delete By Id  //
const childDeleteById = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.CHILD_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const childDetails = await adminService.childDetailsById(paramData.id);
    if (!childDetails) {
      return response.failure(res, 400, message.INVALID_CHILD_ID,);
    }

    if (childDetails.deviceId) {
      console.log(">>>>>>>>>>>>>>>>> ");
      const updatedDevieData = {
        childId: '',
        parentId: '',
        eachDaySchedule: [],
        everyDaySchedule: '',
        scheduledBy: '',
        remainingTime: '0',
        timeSpent: '0'
      }
      const updateDeviceData = await adminService.updateDeviceData(childDetails.deviceId, updatedDevieData);

      if (childDetails.email) {
        //  send mail to connected child  //
        let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/accountDeleteEmail.ejs", { async: true });
        let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [childDetails.email], subject: "Kenan Account", text: messageHtml });
      }
    }

    let updatedData = {
      isDeleted: true,
      parentId: '',
      deviceId: '',
      fcmToken: '',
    }
    const updateChildDataById = await adminService.updateChildDataById(paramData.id, updatedData)
    const parentData = await adminService.parentdetailsById(childDetails.parentId);

    if (parentData.childId.length > 0) {
      let updatedChildArr = await parentData.childId.filter(element => { return (element != paramData.id) });
      const updatedParentData = { childId: updatedChildArr }
      const updateParentById = await adminService.updateParentById(childDetails.parentId, updatedParentData)
    }

    return response.success(res, 200, message.CHILD_DELETED)
  } catch (error) {
    return response.failure(res, 400, error)
  }
}


//  add Gift Type for parent  //
const addGiftType = async (res, bodyData) => {
  try {
    if (!bodyData.name) {
      return response.failure(res, 400, message.GIFT_NAME_REQUIRED);
    }
    // if (!bodyData.icon) {
    //   return response.failure(res, 400, message.GIFT_ICON_REQUIRED);
    // }

    let giftData = {
      name: bodyData.name,
      icon: bodyData.icon || "",
      isDeleted: false
    }

    let addGiftType = await adminService.addGiftType(giftData);
    return response.success(res, 200, message.SUCCESS);
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  gift Type List  //
const giftTypeList = async (res, headers, queryData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    let limit = queryData.limit ? parseInt(queryData.limit) : 10;
    let offset = queryData.skip ? parseInt(queryData.skip) : 0;

    const giftTypeList = await adminService.giftTypeList(limit, offset);
    const totalGiftTypeCount = await adminService.totalGiftTypeCount();

    let data = {
      totalItems: totalGiftTypeCount,
      giftTypeList: giftTypeList
    }
    return response.data(res, data, 200, message.SUCCESS);

  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  update Gift Type By Id  //
const updateGiftTypeById = async (res, headers, paramData, bodyData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    if (!paramData.id) {
      return response.failure(res, 400, message.GIFT_TYPE_ID_REQUIRED,);
    }

    const giftTypeDetails = await adminService.giftTypeDetailsById(paramData.id)
    if (!giftTypeDetails) {
      return response.failure(res, 400, message.INVALID_GIFT_TYPE_ID,);
    }

    let updatedData = {
      name: bodyData.name || giftTypeDetails.name,
      icon: bodyData.icon || giftTypeDetails.icon,
    }
    const updateGiftTypeById = await adminService.updateGiftTypeById(paramData.id, updatedData)

    return response.success(res, 200, message.SUCCESS)

  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  view Gift Type By Id  //
const viewGiftTypeById = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.GIFT_TYPE_ID_REQUIRED,);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const giftTypeDetails = await adminService.giftTypeDetailsById(paramData.id)
    if (!giftTypeDetails) {
      return response.failure(res, 400, message.INVALID_GIFT_TYPE_ID,);
    }

    return response.data(res, giftTypeDetails, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  delete Gift Type By Id  //
const deleteGiftTypeById = async (res, headers, paramData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!paramData.id) {
      return response.failure(res, 400, message.GIFT_TYPE_ID_REQUIRED,);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const giftTypeDetails = await adminService.giftTypeDetailsById(paramData.id)
    if (!giftTypeDetails) {
      return response.failure(res, 400, message.INVALID_GIFT_TYPE_ID,);
    }

    let updatedData = { isDeleted: true }
    let updateGiftTypeById = await adminService.updateGiftTypeById(paramData.id, updatedData)

    return response.success(res, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  dashboard data  //
const dashboard = async (res, headers) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const totalParentCount = await adminService.totalUserCount();
    const totalActiveParentCount = await adminService.totalActiveParentCount();
    const totalInactiveParentCount = await adminService.totalInactiveParentCount();

    const totalChildCount = await adminService.totalChildCount();
    const totalConnectedChildCount = await adminService.totalConnectedChildCount();
    const totalNonConnectedChildCount = await adminService.totalNonConnectedChildCount();

    let data = {
      totalParent: totalParentCount,
      totalActiveParent: totalActiveParentCount,
      totalInactiveParent: totalInactiveParentCount,
      totalchild: totalChildCount,
      totalConnectedChild: totalConnectedChildCount,
      totalNonConnectedChild: totalNonConnectedChildCount
    }
    return response.data(res, data, 200, message.SUCCESS)
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  add/update settings  //
const settings = async (res, headers, bodyData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const settingsDetails = await adminService.settings();

    if (!settingsDetails) {
      let newSettingsData = {
        maxChildAdd: bodyData.maxChildAdd || '0',
        bronzeBadgePoint: bodyData.bronzeBadgePoint || '100',
        silverBadgePoint: bodyData.silverBadgePoint || '200',
        goldBadgePoint: bodyData.goldBadgePoint || '300',

        favorableAppTime: bodyData.favorableAppTime || '5',
        favorableAppAddPoint: bodyData.favorableAppAddPoint || '2',
        favorableAppSubtractPoint: bodyData.favorableAppSubtractPoint || '1',

        unFavorableAppTime: bodyData.unFavorableAppTime || '5',
        unFavorableAppAddPoint: bodyData.unFavorableAppAddPoint || '2',
        unFavorableAppSubtractPoint: bodyData.unFavorableAppSubtractPoint || '1',

        deviceTime: bodyData.deviceTime || '5',
        deviceAddPoint: bodyData.deviceAddPoint || '2',
        deviceSubtractPoint: bodyData.deviceSubtractPoint || '1',
      }

      const addSettings = await adminService.addSettings(newSettingsData);
      const settingsDetails = await adminService.settings();

      return response.data(res, settingsDetails, 200, message.SUCCESS)
    }
    else {
      let updatedSettingsData = {
        maxChildAdd: bodyData.maxChildAdd || settingsDetails.maxChildAdd,
        bronzeBadgePoint: bodyData.bronzeBadgePoint || settingsDetails.bronzeBadgePoint,
        silverBadgePoint: bodyData.silverBadgePoint || settingsDetails.silverBadgePoint,
        goldBadgePoint: bodyData.goldBadgePoint || settingsDetails.goldBadgePoint,

        favorableAppTime: bodyData.favorableAppTime || settingsDetails.favorableAppTime,
        favorableAppAddPoint: bodyData.favorableAppAddPoint || settingsDetails.favorableAppAddPoint,
        favorableAppSubtractPoint: bodyData.favorableAppSubtractPoint || settingsDetails.favorableAppSubtractPoint,

        unFavorableAppTime: bodyData.unFavorableAppTime || settingsDetails.unFavorableAppTime,
        unFavorableAppAddPoint: bodyData.unFavorableAppAddPoint || settingsDetails.unFavorableAppAddPoint,
        unFavorableAppSubtractPoint: bodyData.unFavorableAppSubtractPoint || settingsDetails.unFavorableAppSubtractPoint,

        deviceTime: bodyData.deviceTime || settingsDetails.deviceTime,
        deviceAddPoint: bodyData.deviceAddPoint || settingsDetails.deviceAddPoint,
        deviceSubtractPoint: bodyData.deviceSubtractPoint || settingsDetails.deviceSubtractPoint,
      }

      const updateSettings = await adminService.updateSettings(settingsDetails.settingsId, updatedSettingsData);
      const settingsData = await adminService.settings();

      return response.data(res, settingsData, 200, message.SUCCESS)
    }

  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  get Settings  //
const getSettings = async (res, headers) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const settingsDetails = await adminService.settings();
    return response.data(res, settingsDetails, 200, message.SUCCESS)

  } catch (error) {
    return response.failure(res, 400, error)
  }
}




module.exports = {
  createAdmin,
  adminLogin,
  adminLogout,
  forgotPassword,
  userList,
  parentDetails,
  addParent,
  updateParent,
  deleteParent,
  parentChildList,
  allChildList,
  childDetailsById,
  childDeleteById,
  addGiftType,
  giftTypeList,
  updateGiftTypeById,
  viewGiftTypeById,
  deleteGiftTypeById,
  dashboard,
  settings,
  getSettings,
}