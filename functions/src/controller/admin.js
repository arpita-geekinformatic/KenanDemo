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
        email: "admin@gmail.com",
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


    return response.data(res, adminData, 200, message.SUCCESS)

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

//  update Parent Details by ID  //
const updateParent = async (res, headers, bodyData) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }
    if (!bodyData.id) {
      return response.failure(res, 400, message.USER_ID_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const parentDetails = await adminService.parentdetailsById(bodyData.id);
    if (!parentDetails) {
      return response.failure(res, 400, message.USER_NOT_FOUND);
    }

    let updatedData = {
      name: bodyData.name || parentDetails.name,
      isActive: bodyData.status ? ((bodyData.status == 'active') ? true : false) : parentDetails.isActive
    }

    let updateParentById = await adminService.updateParentById(bodyData.id, updatedData)
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
      icon: bodyData.icon || ""
    }

    let addGiftType = await adminService.addGiftType(giftData);
    return response.success(res, 200, message.SUCCESS);
  } catch (error) {
    return response.failure(res, 400, error)
  }
}

//  gift Type List  //
const giftTypeList = async (res, headers) => {
  try {
    if (!headers.authorization) {
      return response.failure(res, 400, message.TOKEN_REQUIRED);
    }

    const decoded = await KenanUtilities.decryptToken(headers.authorization);
    const adminData = await adminService.findAdminByToken(headers.authorization);
    if (!adminData) {
      return response.failure(res, 400, message.INVALID_TOKEN,);
    }

    const giftTypeList = await adminService.giftTypeList();

    return response.data(res, giftTypeList, 200, message.SUCCESS);

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




module.exports = {
  createAdmin,
  adminLogin,
  adminLogout,
  forgotPassword,
  userList,
  parentDetails,
  updateParent,
  deleteParent,
  addGiftType,
  giftTypeList,
  updateGiftTypeById,
}