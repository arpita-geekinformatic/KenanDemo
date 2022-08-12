const parentService = require("../services/parentService");
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
var QRCode = require('qrcode');
const fs = require('fs');
var qr = require('node-qr-image');
let os = require('os');
const path = require('path');
const tmp = os.tmpdir();


//  parent sign up  //
const signUp = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }
        if (!bodyData.password) {
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }

        let isParentExists = await parentService.isParentExists(bodyData.email);
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
            authToken: "",
            fcmToken: bodyData.fcmToken || "",
            childId: []
        }
        let createParentProfile = await parentService.createParentProfile(newData);

        //  create activation link
        let activationLink = process.env.BASE_URL + "acountAcctivation/" + createParentProfile;
        console.log("********** activationLink : ", activationLink);

        //  Get email template to send email
        let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/activationEmail.ejs", { link: activationLink }, { async: true });

        let mailResponse = await MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Account Activation", text: messageHtml });
        console.log("51  >>>>>>  mailResponse : ", mailResponse);

        return response.success(res, 200, `Your account activation mail was sent to your email address.`);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  account activation  //
const acountAcctivation = async (res, parentId) => {
    try {
        let parentData = await parentService.getParentDataById(parentId);

        if (parentData.isActive) {
            return res.send(`<div className="container">
            <header className="jumbotron">
              <h1>
                <strong>Account already active, please login!</strong>
              </h1>
            </header>
          </div>`);

        }
        let activeParentProfile = await parentService.updateSpecificParentData(parentId, { "isActive": true });

        return res.send(`<div className="container">
            <header className="jumbotron">
            <h1>
                <strong>Account Activated!</strong>
            </h1>
            </header>
        </div>`);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  parent login  //
const login = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }
        if (!bodyData.password) {
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }

        const parentData = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentData) {
            return response.failure(res, 200, message.USER_NOT_FOUND,);
        }
        if (!parentData.isActive) {
            return response.failure(res, 200, message.INACTIVE_ACCOUNT,);
        }

        const match = await KenanUtilities.VerifyPassword(bodyData.password, parentData.password);
        if (!match) {
            return response.failure(res, 200, message.INVALID_PASSWORD);
        }

        const authToken = await KenanUtilities.generateToken(parentData.email, parentData.firestore_parentId);
        parentData.authToken = authToken;
        let newData = {
            name: parentData.name,
            email: parentData.email,
            childId: parentData.childId,
            isActive: parentData.isActive,
            isDeleted: parentData.isDeleted,
            authToken: authToken,
        }
        const updatePatrentData = await parentService.updateParentDataById(parentData.firestore_parentId, newData);

        return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data: newData });
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  log out  //
const logOut = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { authToken: "" })
        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  forgot password  //
const forgotPassword = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentData = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentData) {
            return response.failure(res, 200, message.USER_NOT_FOUND,);
        }
        if (!parentData.isActive) {
            return response.failure(res, 200, message.INACTIVE_ACCOUNT,);
        }

        let randomOTP = KenanUtilities.genNumericCode(4);
        let expiredDate = moment().add(10, 'm');
        let newData = {
            otp: randomOTP,
            otpVerified: false,
            otpExipredAt: `${expiredDate}`
        }

        //  Get email template to send email
        let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/otpEmail.ejs", { otp: randomOTP }, { async: true });
        let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Forgot Password", text: messageHtml });

        let updateParentData = await parentService.updateSpecificParentData(parentData.firestore_parentId, newData)
        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  verify OTP  //
const verifyOTP = async (res, bodyData) => {
    try {
        if (!bodyData.otp) {
            return response.failure(res, 200, message.OTP_REQUIRED);
        }
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentRes = await parentService.getParentDataByOTP(bodyData);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_OTP);
        }

        // Check if otp is expired or not ( otp valid for 1 minutes)
        let currentDateTime = moment();
        let date = new Date(parentRes.otpExipredAt);
        let otpExpireTime = moment(date);

        if (currentDateTime.diff(otpExpireTime, 'm') > 10) {
            return response.failure(res, 200, message.OTP_EXPIRED);
        }

        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { otpVerified: true });
        newData = { authToken: parentRes.authToken }
        return res.send({ responseCode: 200, status: true, message: message.OTP_VERIFIED, data: newData });

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  resend OTP  //
const resendOTP = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentRes = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentRes) {
            return response.failure(res, 200, message.USER_NOT_FOUND);
        }
        let randomOTP = KenanUtilities.genNumericCode(4);
        let expiredDate = moment().add(10, 'm');
        let newData = {
            otp: randomOTP,
            otpVerified: false,
            otpExipredAt: `${expiredDate}`
        }

        //  Get email template to send email  //
        let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/otpEmail.ejs", { otp: randomOTP }, { async: true });
        let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "OTP Verification", text: messageHtml });

        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, newData);
        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  newPassword  //
const newPassword = async (res, bodyData, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.newPassword) {
            return response.failure(res, 200, message.NEW_PASSWORD_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let hashedPassword = await KenanUtilities.cryptPassword(bodyData.newPassword);
        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { password: hashedPassword });

        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  reset Password  //
const resetPassword = async (res, bodyData, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.password) {
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }
        if (!bodyData.newPassword) {
            return response.failure(res, 200, message.NEW_PASSWORD_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        const match = await KenanUtilities.VerifyPassword(bodyData.password, parentRes.password);
        if (!match) {
            return response.failure(res, 200, message.INVALID_PASSWORD);
        }

        let hashedPassword = await KenanUtilities.cryptPassword(bodyData.newPassword);
        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { password: hashedPassword });

        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get Parent Profile details  //
const getParentProfile = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        // let parentDetails = {
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        //     name : parentRes.name,
        // }
        return response.data(res, parentRes, 200, message.SUCCESS);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Child  //
const addChild = async (res, bodyData, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.name) {
            return response.failure(res, 200, message.KID_NAME_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childData = await parentService.getChildByParent(bodyData.name, parentRes.firestore_parentId);

        if (!childData) {
            const newData = {
                name: bodyData.name,
                age: bodyData.age || 0,
                email: bodyData.email || "",
                gender: bodyData.gender || "",
                photo: "",
                parentId: parentRes.firestore_parentId,
                deviceId: bodyData.deviceId || "",
                isDeleted: false,
                fcmToken: bodyData.fcmToken || "",
            }

            let addChildByParent = await parentService.addChildByParent(newData);
            newData.childId = addChildByParent;

            if (bodyData.email && (bodyData.email != '')) {

                // send mail to child with QR code  //
                let qrData = parentRes.firestore_parentId + '_' + addChildByParent;

                var qr_svg = qr.image(qrData, { type: 'png' });
                console.log(">>>>>> qr_svg : ", qr_svg);
                // qr_svg.pipe(require('fs').createWriteStream(`./src/views/qrCode/${addChildByParent}.png`));
                qr_svg.pipe(require('fs').createWriteStream(os.tmpdir() + `/${addChildByParent}.png`));
                var svg_string = qr.imageSync(qrData, { type: 'png' });

                let attachments = [{
                    path: os.tmpdir() + `/${addChildByParent}.png`
                }]

                let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/qrCodeEmail.ejs", { data: "url" }, { async: true });
                let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "QR Code", text: messageHtml, attachments: attachments });

            }
            return res.send({ responseCode: 200, status: true, message: message.KID_ADDED, data: newData });
        }

        return res.send({ responseCode: 200, status: true, message: message.KID_EXISTS, data: {} });
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child List  //
const childList = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childList = await parentService.getChildList(parentRes.firestore_parentId)
        return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data: childList });
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  delete Child by Id  //
const deleteChild = async (res, headers, paramData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!paramData.id) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childData = await parentService.getChildDataById(paramData.id);
        if (!childData) {
            return response.failure(res, 200, message.INVALID_CHILD_ID);
        }

        let deleteChildById = await parentService.deleteChildById(paramData.id);
        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get Child By Parent  //
const getChildByParent = async (res, headers, paramData) => {
    try {
        if (!paramData.id) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childProfileDetails = await parentService.getChildDataById(paramData.id);

        if (!childProfileDetails) {
            return response.failure(res, 200, message.INVALID_CHILD_ID);
        }

        return response.data(res, childProfileDetails, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child device app list  //
const childDeviceAppList = async (res, headers, bodyData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.deviceId) {
            return response.failure(res, 200, message.REQUIRE_CHILD_DEVICE_ID);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childDeviceAppList = await parentService.childDeviceAppList(bodyData.deviceId)
        return response.data(res, childDeviceAppList, 200, message.SUCCESS);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add App Usage  //
const addAppUsage = async (res, headers, bodyData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.packageName) {
            return response.failure(res, 200, message.REQUIRE_PACKAGE_NAME);
        }
        if (!bodyData.status) {
            return response.failure(res, 200, message.REQUIRE_APP_STATUS);
        }
        if (!bodyData.scheduledBy) {
            return response.failure(res, 200, message.REQUIRE_SCHEDULE);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childRes = await parentService.getChildDataById(bodyData.childId);

        if (bodyData.scheduledBy == 'everyDay') {
            let updateData = {
                status: parseInt(bodyData.status),
                scheduledBy: bodyData.scheduledBy,
                eachDaySchedule: [],
                everyDaySchedule: bodyData.everyDaySchedule
            }

            let getDeviceAppsIdByPackageName = await parentService.getDeviceAppsIdByPackageName(childRes.deviceId, bodyData.packageName);
            let updateDeviceAppsById = await parentService.updateDeviceAppsById(getDeviceAppsIdByPackageName, updateData);
        }
        if (bodyData.scheduledBy == 'eachDay') {
            let updateData = {
                status: parseInt(bodyData.status),
                scheduledBy: bodyData.scheduledBy,
                eachDaySchedule: bodyData.eachDaySchedule,
                everyDaySchedule: ""
            }

            let getDeviceAppsIdByPackageName = await parentService.getDeviceAppsIdByPackageName(childRes.deviceId, bodyData.packageName);
            let updateDeviceAppsById = await parentService.updateDeviceAppsById(getDeviceAppsIdByPackageName, updateData);
        }

        return response.success(res, 200, message.APP_USAGE_UPDATED);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  gift Type Dropdown  //
const giftTypeDropdown = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let giftTypeDropdown = await parentService.giftTypeDropdown();
        return response.data(res, giftTypeDropdown, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Gift for child  //
const addGift = async (res, headers, bodyData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.giftName) {
            return response.failure(res, 200, message.GIFT_NAME_REQUIRED);
        }
        // if (!bodyData.giftIcon) {
        //     return response.failure(res, 200, message.GIFT_ICON_REQUIRED);
        // }
        if (!bodyData.points) {
            return response.failure(res, 200, message.POINTS_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let giftData = {
            childId: bodyData.childId,
            parentId: parentRes.firestore_parentId,
            giftName: bodyData.giftName,
            giftIcon: bodyData.giftIcon || '',
            points: parseInt(bodyData.points),
            isDeleted: false
        }

        let addGift = await parentService.addGift(giftData);
        return response.success(res, 200, message.GIFT_ADDED_SUCCESSFULLY);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child Gift List by Id  //
const childGiftList = async (res, headers, bodyData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childGiftListById = await parentService.childGiftListById(bodyData.childId, parentRes.firestore_parentId);
        return response.data(res, childGiftListById, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  delete Child Gift By Id  //
const deleteChildGiftById = async (res, headers, paramData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!paramData.id) {
            return response.failure(res, 200, message.GIFT_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let deleteChildGiftById = await parentService.deleteChildGiftById(paramData.id);
        return response.success(res, 200, message.GIFT_DELETED_SUCCESSFULLY);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}


module.exports = {
    signUp,
    acountAcctivation,
    login,
    logOut,
    forgotPassword,
    verifyOTP,
    resendOTP,
    newPassword,
    resetPassword,
    getParentProfile,
    addChild,
    childList,
    deleteChild,
    getChildByParent,
    childDeviceAppList,
    addAppUsage,
    giftTypeDropdown,
    addGift,
    childGiftList,
    deleteChildGiftById,
}