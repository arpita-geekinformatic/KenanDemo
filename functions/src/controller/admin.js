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

//  add Gift Type for parent  //
const addGiftType = async (res, bodyData) => {
  try {
    if (!bodyData.name) {
      return response.failure(res, 200, message.GIFT_NAME_REQUIRED);
    }
    // if (!bodyData.icon) {
    //   return response.failure(res, 200, message.GIFT_ICON_REQUIRED);
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





module.exports = {
  createAdmin,
  addGiftType,
}