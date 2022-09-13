const parentService = require("../services/parentService");
const response = require("../utils/response");
const message = require("../utils/message");
const arabicMessage = require('../utils/arabicMessage');
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
const signUp = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.email) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.EMAIL_REQUIRED);
            }
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }
        if (!bodyData.password) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.PASSWORD_REQUIRED);
            }
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }

        let isParentExists = await parentService.isParentExists(bodyData.email);
        if (isParentExists) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.USER_EXISTS);
            }
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
            photo: '',
        }
        let createParentProfile = await parentService.createParentProfile(newData);

        //  create activation link
        let activationLink = process.env.BASE_URL + "acountAcctivation/" + createParentProfile;
        console.log("********** activationLink : ", activationLink);

        //  Get email template to send email in ARABIC 
        if (headers.lang == 'ar') {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/arabic/activationEmail.ejs", { link: activationLink }, { async: true });
            let mailResponse = await MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "رابط تفعيل الحساب.", text: messageHtml });

            return response.success(res, 200, arabicMessage.ACTIVATION_MAIL_SENT);
        }
        //  Get email template to send email in ENGLISH 
        else {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/english/activationEmail.ejs", { link: activationLink }, { async: true });
            let mailResponse = await MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Account Activation", text: messageHtml });

            return response.success(res, 200, message.ACTIVATION_MAIL_SENT);
        }
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
const login = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.email) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.EMAIL_REQUIRED);
            }
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }
        if (!bodyData.password) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.PASSWORD_REQUIRED);
            }
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }

        let parentData = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.USER_NOT_FOUND);
            }
            return response.failure(res, 200, message.USER_NOT_FOUND,);
        }
        if (!parentData.isActive) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INACTIVE_ACCOUNT);
            }
            return response.failure(res, 200, message.INACTIVE_ACCOUNT,);
        }

        const match = await KenanUtilities.VerifyPassword(bodyData.password, parentData.password);
        if (!match) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_PASSWORD);
            }
            return response.failure(res, 200, message.INVALID_PASSWORD);
        }

        const authToken = await KenanUtilities.generateToken(parentData.email, parentData.firestore_parentId);
        parentData.authToken = authToken;
        let newData = {
            authToken: authToken,
            fcmToken: bodyData.fcmToken || parentData.fcmToken,
        }
        const updatePatrentData = await parentService.updateParentDataById(parentData.firestore_parentId, newData);

        delete parentData.password

        if (headers.lang == 'ar') {
            return response.data(res, parentData, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, parentData, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  log out  //
const logOut = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { authToken: "" })

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.SUCCESS);
        } else {
            return response.success(res, 200, message.SUCCESS);
        }

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  forgot password  //
const forgotPassword = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.email) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.EMAIL_REQUIRED);
            }
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentData = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.USER_NOT_FOUND);
            }
            return response.failure(res, 200, message.USER_NOT_FOUND,);
        }
        if (!parentData.isActive) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INACTIVE_ACCOUNT);
            }
            return response.failure(res, 200, message.INACTIVE_ACCOUNT,);
        }

        let randomOTP = KenanUtilities.genNumericCode(4);
        let expiredDate = moment().add(10, 'm');
        let newData = {
            otp: randomOTP,
            otpVerified: false,
            otpExipredAt: `${expiredDate}`
        }

        //  Get email template to send email in ARABIC 
        if (headers.lang == 'ar') {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/arabic/otpEmail.ejs", { otp: randomOTP }, { async: true });
            let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: 'قم بتغيير كلمة المرور.', text: messageHtml });

            let updateParentData = await parentService.updateSpecificParentData(parentData.firestore_parentId, newData)
            return response.success(res, 200, arabicMessage.SUCCESS);
        }
        //  Get email template to send email in ENGLISH
        else {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/english/otpEmail.ejs", { otp: randomOTP }, { async: true });
            let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Forgot Password", text: messageHtml });

            let updateParentData = await parentService.updateSpecificParentData(parentData.firestore_parentId, newData)
            return response.success(res, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  verify OTP  //
const verifyOTP = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.otp) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.OTP_REQUIRED);
            }
            return response.failure(res, 200, message.OTP_REQUIRED);
        }
        if (!bodyData.email) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.EMAIL_REQUIRED);
            }
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentRes = await parentService.getParentDataByOTP(bodyData);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_OTP);
            }
            return response.failure(res, 200, message.INVALID_OTP);
        }

        // Check if otp is expired or not ( otp valid for 1 minutes)
        let currentDateTime = moment();
        let date = new Date(parentRes.otpExipredAt);
        let otpExpireTime = moment(date);

        if (currentDateTime.diff(otpExpireTime, 'm') > 10) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.OTP_EXPIRED);
            }
            return response.failure(res, 200, message.OTP_EXPIRED);
        }

        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { otpVerified: true });
        newData = { authToken: parentRes.authToken };

        if (headers.lang == 'ar') {
            return response.data(res, newData, 200, arabicMessage.OTP_VERIFIED)
        } else {
            return response.data(res, newData, 200, message.OTP_VERIFIED)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  resend OTP  //
const resendOTP = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.email) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.EMAIL_REQUIRED);
            }
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        const parentRes = await parentService.getParentDataByEmail(bodyData.email);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.USER_NOT_FOUND);
            }
            return response.failure(res, 200, message.USER_NOT_FOUND);
        }
        let randomOTP = KenanUtilities.genNumericCode(4);
        let expiredDate = moment().add(10, 'm');
        let newData = {
            otp: randomOTP,
            otpVerified: false,
            otpExipredAt: `${expiredDate}`
        }

        //  Get email template to send email in ARABIC //
        if (headers.lang == 'ar') {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/arabic/otpEmail.ejs", { otp: randomOTP }, { async: true });
            let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "التحقق من OTP", text: messageHtml });

            let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, newData);
            return response.success(res, 200, arabicMessage.SUCCESS);
        }

        //  Get email template to send email in ENGLISH  //
        else {
            let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/english/otpEmail.ejs", { otp: randomOTP }, { async: true });
            let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "OTP Verification", text: messageHtml });

            let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, newData);
            return response.success(res, 200, message.SUCCESS);
        }

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  newPassword  //
const newPassword = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.newPassword) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.NEW_PASSWORD_REQUIRED);
            }
            return response.failure(res, 200, message.NEW_PASSWORD_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let hashedPassword = await KenanUtilities.cryptPassword(bodyData.newPassword);
        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { password: hashedPassword });

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.SUCCESS);
        }
        else {
            return response.success(res, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  reset Password  //
const resetPassword = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.password) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.PASSWORD_REQUIRED);
            }
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }
        if (!bodyData.newPassword) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.NEW_PASSWORD_REQUIRED);
            }
            return response.failure(res, 200, message.NEW_PASSWORD_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        const match = await KenanUtilities.VerifyPassword(bodyData.password, parentRes.password);
        if (!match) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_PASSWORD);
            }
            return response.failure(res, 200, message.INVALID_PASSWORD);
        }

        let hashedPassword = await KenanUtilities.cryptPassword(bodyData.newPassword);
        let updateParentData = await parentService.updateSpecificParentData(parentRes.firestore_parentId, { password: hashedPassword });

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.SUCCESS);
        } else {
            return response.success(res, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get Parent Profile details  //
const getParentProfile = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        if (headers.lang == 'ar') {
            return response.data(res, parentRes, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, parentRes, 200, message.SUCCESS);
        }

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  update Parent Profile  //
const updateParentProfile = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let updatedData = {
            photo: bodyData.photo || parentRes.photo,
            fcmToken: bodyData.fcmToken || parentRes.fcmToken
        }
        let updateParentProfile = await parentService.updateParentDataById(parentRes.firestore_parentId, updatedData);
        let parentDetails = await parentService.getParentDataById(parentRes.firestore_parentId);

        if (headers.lang == 'ar') {
            return response.data(res, parentDetails, 200, arabicMessage.PROFILE_UPDATED);
        } else {
            return response.data(res, parentDetails, 200, message.PROFILE_UPDATED)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Child  //
const addChild = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.name) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.KID_NAME_REQUIRED);
            }
            return response.failure(res, 200, message.KID_NAME_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let settingsData = await parentService.getSettings();
        let maxChildAdd = parseInt(settingsData.maxChildAdd);
        if (maxChildAdd <= parentRes.childId.length) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.MAX_CHILD_REACHED);
            }
            return response.failure(res, 200, message.MAX_CHILD_REACHED);
        }

        let childData = await parentService.getChildByParent(bodyData.name, parentRes.firestore_parentId);

        if (!childData) {
            const newData = {
                name: bodyData.name,
                age: bodyData.age || 0,
                email: bodyData.email || "",
                gender: bodyData.gender || "",
                photo: bodyData.photo || "",
                parentId: parentRes.firestore_parentId,
                deviceId: bodyData.deviceId || "",
                isDeleted: false,
                fcmToken: bodyData.fcmToken || "",
                points: 0,
                badge: 0
            }

            let addChildByParent = await parentService.addChildByParent(newData);
            newData.childId = addChildByParent;

            parentRes.childId.push(addChildByParent);
            let updatedParentData = { childId: parentRes.childId }
            const updateParentData = await parentService.updateParentDataById(parentRes.firestore_parentId, updatedParentData)

            if (bodyData.email && (bodyData.email != '')) {

                // send mail to child with QR code  //
                let qrData = parentRes.firestore_parentId + '_' + addChildByParent;
                var qr_svg = qr.image(qrData, { type: 'png' });
                qr_svg.pipe(require('fs').createWriteStream(os.tmpdir() + `/${addChildByParent}.png`));
                var svg_string = qr.imageSync(qrData, { type: 'png' });

                let attachments = [{
                    path: os.tmpdir() + `/${addChildByParent}.png`
                }]

                //  send QR code mail in ARABIC  //
                if (headers.lang == 'ar') {
                    let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/arabic/qrCodeEmail.ejs", { data: "url" }, { async: true });
                    let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "رمز الاستجابة السريعة.", text: messageHtml, attachments: attachments });
                }
                //  send QR code mail in ENGLISH  //
                else {
                    let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/english/qrCodeEmail.ejs", { data: "url" }, { async: true });
                    let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "QR Code", text: messageHtml, attachments: attachments });
                }
            }

            if (headers.lang == 'ar') {
                return response.data(res, newData, 200, arabicMessage.KID_ADDED);
            } else {
                return response.data(res, newData, 200, message.KID_ADDED);
            }
        }

        if (headers.lang == 'ar') {
            return response.failure(res, 200, arabicMessage.KID_EXISTS);
        } else {
            return response.failure(res, 200, message.KID_EXISTS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child List  //
const childList = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childList = await parentService.getChildList(parentRes.firestore_parentId);

        if (childList.length > 0) {
            for (let childs of childList) {
                if (childs.deviceId != '') {
                    let deviceData = await parentService.getDeviceDataById(childs.deviceId);
                    childs.scheduledBy = deviceData.scheduledBy || '';
                    childs.eachDaySchedule = deviceData.eachDaySchedule || [];
                    childs.everyDaySchedule = deviceData.everyDaySchedule || '';
                    childs.timeSpent = deviceData.timeSpent || '';
                }
                else {
                    childs.scheduledBy = '';
                    childs.eachDaySchedule = [];
                    childs.everyDaySchedule = '';
                    childs.timeSpent = '';
                }
            }
        }

        if (headers.lang == 'ar') {
            return response.data(res, childList, 200, arabicMessage.SUCCESS)
        } else {
            return response.data(res, childList, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  delete Child by Id  //
const deleteChild = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childData = await parentService.getChildDataById(paramData.id);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_CHILD_ID);
            }
            return response.failure(res, 200, message.INVALID_CHILD_ID);
        }

        let updatedChildIdArr = await parentRes.childId.filter(element => { return (element != paramData.id) });
        let updatedParentData = { childId: updatedChildIdArr };
        let updateParentData = await parentService.updateParentDataById(parentRes.firestore_parentId, updatedParentData)

        let deleteChildById = await parentService.deleteChildById(paramData.id);

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.SUCCESS);
        } else {
            return response.success(res, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get Child By Parent  //
const getChildByParent = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childProfileDetails = await parentService.getChildDataById(paramData.id);

        if (!childProfileDetails) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_CHILD_ID);
            }
            return response.failure(res, 200, message.INVALID_CHILD_ID);
        }

        //  check child badge  //
        let settings = await parentService.getSettings();
        if (childProfileDetails.points > 0) {
            if ((parseInt(settings.bronzeBadgePoint) <= parseInt(childProfileDetails.points)) && (parseInt(childProfileDetails.points) < parseInt(settings.silverBadgePoint)) && (childProfileDetails.badge < 1)) {
                console.log('================ BRONZE =========',);
                let updatedData = { badge: 1 }
                let updateChildDataById = await parentService.updateChildDataById(paramData.id, updatedData)
                childProfileDetails.badge = 1
            }

            if ((parseInt(settings.silverBadgePoint) <= parseInt(childProfileDetails.points)) && (parseInt(childProfileDetails.points) < parseInt(settings.goldBadgePoint)) && (childProfileDetails.badge < 2)) {
                console.log('++++++++++++++++ SILVER +++++++++');
                let updatedData = { badge: 2 }
                let updateChildDataById = await parentService.updateChildDataById(paramData.id, updatedData)
                childProfileDetails.badge = 2
            }

            if ((parseInt(settings.goldBadgePoint) <= parseInt(childProfileDetails.points)) && (childProfileDetails.badge < 3)) {
                console.log('>>>>>>>>>>>>>>>> GOLD >>>>>>>>>');
                let updatedData = { badge: 3 }
                let updateChildDataById = await parentService.updateChildDataById(paramData.id, updatedData)
                childProfileDetails.badge = 3
            }
        }

        if (childProfileDetails.deviceId) {
            const deviceDetails = await parentService.getDeviceDataById(childProfileDetails.deviceId)

            childProfileDetails.scheduledBy = deviceDetails.scheduledBy || '';
            childProfileDetails.eachDaySchedule = deviceDetails.eachDaySchedule || [];
            childProfileDetails.everyDaySchedule = deviceDetails.everyDaySchedule || '';
            childProfileDetails.timeSpent = deviceDetails.timeSpent || '0';
        }
        else {
            childProfileDetails.scheduledBy = '';
            childProfileDetails.eachDaySchedule = [];
            childProfileDetails.everyDaySchedule = '';
            childProfileDetails.timeSpent = '0';
        }

        if (headers.lang == 'ar') {
            return response.data(res, childProfileDetails, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, childProfileDetails, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child device app list  //
const childDeviceAppList = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.deviceId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.REQUIRE_CHILD_DEVICE_ID);
            }
            return response.failure(res, 200, message.REQUIRE_CHILD_DEVICE_ID);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childDeviceAppList = await parentService.childDeviceAppList(bodyData.deviceId);

        if (headers.lang == 'ar') {
            return response.data(res, childDeviceAppList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, childDeviceAppList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add App Usage  //
const addAppUsage = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.scheduledBy) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.REQUIRE_SCHEDULE);
            }
            return response.failure(res, 200, message.REQUIRE_SCHEDULE);
        }
        if (!bodyData.type) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TYPE_IS_REQUIRED);
            }
            return response.failure(res, 200, message.TYPE_IS_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childRes = await parentService.getChildDataById(bodyData.childId);
        let childDeviceDetails = await parentService.getDeviceDataById(childRes.deviceId);
        let childFcmToken = childDeviceDetails.fcmToken;

        const dayNameArr = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const dayName = dayNameArr[new Date().getDay()];
        const day = new Date().getDay();
        console.log('>>>>>>> dayName : ', dayName, '  >>>>> day : ', day);


        //  set app usage  //
        if (bodyData.type == 'appUsage') {
            if (!bodyData.packageName) {
                if (headers.lang == 'ar') {
                    return response.failure(res, 200, arabicMessage.REQUIRE_PACKAGE_NAME);
                }
                return response.failure(res, 200, message.REQUIRE_PACKAGE_NAME);
            }
            if (!([0, 1].includes(parseInt(bodyData.status)))) {
                if (headers.lang == 'ar') {
                    return response.failure(res, 200, arabicMessage.REQUIRE_APP_STATUS);
                }
                return response.failure(res, 200, message.REQUIRE_APP_STATUS);
            }

            if (childDeviceDetails.scheduledBy == '') {
                if (headers.lang == 'ar') {
                    return response.failure(res, 200, arabicMessage.SELECT_DEVICE_USAGE);
                }
                return response.failure(res, 200, message.SELECT_DEVICE_USAGE);
            }

            if (bodyData.scheduledBy == 'everyDay') {
                //  check if selected time is less then selected device time or not  //
                if (childDeviceDetails.scheduledBy == 'everyDay') {
                    for (let day of dayNameArr) {
                        let deviceAppsEverydaySchedule = await parentService.deviceAppsEverydaySchedule(childRes.deviceId, bodyData.packageName);
                        let deviceAppsEachdaySchedule = await parentService.deviceAppsEachdaySchedule(childRes.deviceId, bodyData.packageName, day);

                        let existingTotalTimeSchedule = parseInt(deviceAppsEverydaySchedule) + parseInt(deviceAppsEachdaySchedule)
                        let newTotalTimeSchedule = parseInt(existingTotalTimeSchedule) + parseInt(bodyData.everyDaySchedule)
                        console.log('966 ==== existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  ==== newTotalTimeSchedule : ', newTotalTimeSchedule, '  ==== device everyDaySchedule : ', childDeviceDetails.everyDaySchedule);

                        if (parseInt(childDeviceDetails.everyDaySchedule) < parseInt(newTotalTimeSchedule)) {
                            if (headers.lang == 'ar') {
                                return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                            }
                            return response.failure(res, 200, message.APP_TIME_WARNING);
                        }
                    }
                }
                //  check if selected time is less then selected device time or not  //
                if (childDeviceDetails.scheduledBy == 'eachDay') {
                    let eachDayArr = await childDeviceDetails.eachDaySchedule.filter(element => {
                        return (element.status == true)
                    })

                    for (let dateData of eachDayArr) {
                        let deviceAppsEverydaySchedule = await parentService.deviceAppsEverydaySchedule(childRes.deviceId, bodyData.packageName);
                        let deviceAppsEachdaySchedule = await parentService.deviceAppsEachdaySchedule(childRes.deviceId, bodyData.packageName, dateData.day);

                        let existingTotalTimeSchedule = parseInt(deviceAppsEverydaySchedule) + parseInt(deviceAppsEachdaySchedule)
                        let newTotalTimeSchedule = parseInt(existingTotalTimeSchedule) + parseInt(bodyData.everyDaySchedule)
                        console.log('988 ==== existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  ==== newTotalTimeSchedule : ', newTotalTimeSchedule, '  === device EachDaySchedule : ', dateData.time);

                        if (parseInt(dateData.time) < parseInt(newTotalTimeSchedule)) {
                            if (headers.lang == 'ar') {
                                return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                            }
                            return response.failure(res, 200, message.APP_TIME_WARNING);
                        }


                    }
                }

                let updateData = {
                    status: parseInt(bodyData.status),
                    scheduledBy: bodyData.scheduledBy,
                    eachDaySchedule: [],
                    everyDaySchedule: bodyData.everyDaySchedule
                }
                let getDeviceAppsIdByPackageName = await parentService.getDeviceAppsIdByPackageNameAndId(childRes.deviceId, bodyData.packageName);
                let updateDeviceAppsById = await parentService.updateDeviceAppsById(getDeviceAppsIdByPackageName, updateData);

                //  send notification to child device  //
                let sendAppUsageNotification = await notificationData.sendAppUsageNotification(bodyData, updateData, childRes, parentRes, childFcmToken);
            }

            if (bodyData.scheduledBy == 'eachDay') {
                //  check if selected time is less then selected device time or not  //
                if (childDeviceDetails.scheduledBy == 'everyDay') {

                    for (let day of dayNameArr) {
                        let eachDaySchedule = await bodyData.eachDaySchedule.filter(element => { return ((element.status == true) && (element.day == day) && (element.time != '')) });

                        if (eachDaySchedule.length > 0) {
                            let deviceAppsEverydaySchedule = await parentService.deviceAppsEverydaySchedule(childRes.deviceId, bodyData.packageName);
                            let deviceAppsEachdaySchedule = await parentService.deviceAppsEachdaySchedule(childRes.deviceId, bodyData.packageName, day);
                            let existingTotalTimeSchedule = parseInt(deviceAppsEverydaySchedule) + parseInt(deviceAppsEachdaySchedule)

                            let newTotalTimeSchedule = (parseInt(existingTotalTimeSchedule) + parseInt(eachDaySchedule[0].time))

                            console.log('1028 ++++ existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  ++++ newTotalTimeSchedule : ', newTotalTimeSchedule, '  ++++ device everyDaySchedule : ', childDeviceDetails.everyDaySchedule);

                            if (parseInt(childDeviceDetails.everyDaySchedule) < parseInt(newTotalTimeSchedule)) {
                                if (headers.lang == 'ar') {
                                    return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                                }
                                return response.failure(res, 200, message.APP_TIME_WARNING);
                            }
                        }
                    }
                }
                //  check if selected time is less then selected device time or not  //
                if (childDeviceDetails.scheduledBy == 'eachDay') {
                    let eachDayArr = await childDeviceDetails.eachDaySchedule.filter(element => {
                        return (element.status == true)
                    })

                    for (let dateData of eachDayArr) {
                        let deviceAppsEverydaySchedule = await parentService.deviceAppsEverydaySchedule(childRes.deviceId, bodyData.packageName);
                        let deviceAppsEachdaySchedule = await parentService.deviceAppsEachdaySchedule(childRes.deviceId, bodyData.packageName, dateData.day);

                        let existingTotalTimeSchedule = parseInt(deviceAppsEverydaySchedule) + parseInt(deviceAppsEachdaySchedule)

                        let newEachDayArr = await bodyData.eachDaySchedule.filter(element => {
                            return ((element.day.toLowerCase() == dateData.day.toLowerCase()) && (element.status == true))
                        })
                        if (newEachDayArr.length > 0) {
                            let newTotalTimeSchedule = parseInt(existingTotalTimeSchedule) + parseInt(newEachDayArr[0].time.toLowerCase())
                            console.log('1056 ++++ existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  ++++ newTotalTimeSchedule : ', newTotalTimeSchedule, '  ++++ device EachDaySchedule : ', dateData.time);

                            if (parseInt(dateData.time) < parseInt(newTotalTimeSchedule)) {
                                if (headers.lang == 'ar') {
                                    return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                                }
                                return response.failure(res, 200, message.APP_TIME_WARNING);
                            }
                        }
                    }
                }

                let updateData = {
                    status: parseInt(bodyData.status),
                    scheduledBy: bodyData.scheduledBy,
                    eachDaySchedule: bodyData.eachDaySchedule,
                    everyDaySchedule: ""
                }

                let getDeviceAppsIdByPackageName = await parentService.getDeviceAppsIdByPackageNameAndId(childRes.deviceId, bodyData.packageName);
                let updateDeviceAppsById = await parentService.updateDeviceAppsById(getDeviceAppsIdByPackageName, updateData);

                //  send notification to child device  //
                let sendAppUsageNotification = await notificationData.sendAppUsageNotification(bodyData, updateData, childRes, parentRes, childFcmToken);
            }

            if (headers.lang == 'ar') {
                return response.data(res, bodyData, 200, arabicMessage.APP_USAGE_UPDATED);
            } else {
                return response.data(res, bodyData, 200, message.APP_USAGE_UPDATED);
            }
        }

        //  set device usage  //
        if (bodyData.type == 'deviceUsage') {
            if (bodyData.scheduledBy == 'everyDay') {
                //  check if selected time is less then all apps time or not  //
                for (let day of dayNameArr) {
                    let allDeviceAppsEverydaySchedule = await parentService.allDeviceAppsEverydaySchedule(childRes.deviceId);
                    let allDeviceAppsEachdaySchedule = await parentService.allDeviceAppsEachdaySchedule(childRes.deviceId, day);
                    let existingTotalTimeSchedule = parseInt(allDeviceAppsEverydaySchedule) + parseInt(allDeviceAppsEachdaySchedule)
                    console.log('1097 >>>> existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  >>>> device everyDaySchedule : ', bodyData.everyDaySchedule);

                    if (parseInt(bodyData.everyDaySchedule) < parseInt(existingTotalTimeSchedule)) {
                        if (headers.lang == 'ar') {
                            return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                        }
                        return response.failure(res, 200, message.APP_TIME_WARNING);
                    }
                }

                let updateData = {
                    scheduledBy: bodyData.scheduledBy,
                    eachDaySchedule: [],
                    everyDaySchedule: bodyData.everyDaySchedule
                }

                let updateDeviceDataById = await parentService.updateDeviceDataById(childRes.deviceId, updateData)
                //  send notification to child device  //
                let deviceUsageNotification = await notificationData.sendDeviceUsageNotification(bodyData, updateData, childRes, parentRes, childFcmToken);
            }

            if (bodyData.scheduledBy == 'eachDay') {
                //  check if selected time is less then all apps time or not  //
                let eachDayArr = await bodyData.eachDaySchedule.filter(element => {
                    return (element.status == true)
                })

                for (let dateData of eachDayArr) {
                    let allDeviceAppsEverydaySchedule = await parentService.allDeviceAppsEverydaySchedule(childRes.deviceId);
                    let allDeviceAppsEachdaySchedule = await parentService.allDeviceAppsEachdaySchedule(childRes.deviceId, dateData.day);

                    let existingTotalTimeSchedule = parseInt(allDeviceAppsEverydaySchedule) + parseInt(allDeviceAppsEachdaySchedule)
                    console.log('1129 >>>>> existingTotalTimeSchedule : ', existingTotalTimeSchedule, '  >>>> device everyDaySchedule : ', bodyData.everyDaySchedule);

                    if (parseInt(bodyData.everyDaySchedule) < parseInt(existingTotalTimeSchedule)) {
                        if (headers.lang == 'ar') {
                            return response.failure(res, 200, arabicMessage.APP_TIME_WARNING);
                        }
                        return response.failure(res, 200, message.APP_TIME_WARNING);
                    }
                }

                let updateData = {
                    scheduledBy: bodyData.scheduledBy,
                    eachDaySchedule: bodyData.eachDaySchedule,
                    everyDaySchedule: ""
                }

                let updateDeviceDataById = await parentService.updateDeviceDataById(childRes.deviceId, updateData)
                //  send notification to child device  //
                let deviceUsageNotification = await notificationData.sendDeviceUsageNotification(bodyData, updateData, childRes, parentRes, childFcmToken);
            }

            if (headers.lang == 'ar') {
                return response.data(res, bodyData, 200, arabicMessage.APP_USAGE_UPDATED);
            } else {
                return response.data(res, bodyData, 200, message.APP_USAGE_UPDATED);
            }
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  gift Type Dropdown  //
const giftTypeDropdown = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let giftTypeDropdown = await parentService.giftTypeDropdown();

        if (headers.lang == 'ar') {
            return response.data(res, giftTypeDropdown, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, giftTypeDropdown, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Gift for child  //
const addGift = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.giftName) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.GIFT_NAME_REQUIRED);
            }
            return response.failure(res, 200, message.GIFT_NAME_REQUIRED);
        }
        // if (!bodyData.giftIcon) {
        //     return response.failure(res, 200, message.GIFT_ICON_REQUIRED);
        // }
        if (!bodyData.points) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.POINTS_REQUIRED);
            }
            return response.failure(res, 200, message.POINTS_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        const childGiftDetails = await parentService.childGiftListById(bodyData.childId, parentRes.firestore_parentId);
        if (childGiftDetails.length > 0) {
            const notRedeemGiftArr = await childGiftDetails.filter(element => { return (!element.redeemGift) })
            console.log('>>>>>>>>>  notRedeemGiftArr : ', notRedeemGiftArr.length);
            if (notRedeemGiftArr.length == 6) {
                if (headers.lang == 'ar') {
                    return response.success(res, 200, arabicMessage.MAX_GIFT_EXCEED);
                } else {
                    return response.success(res, 200, message.MAX_GIFT_EXCEED);
                }
            }
        }

        let giftData = {
            childId: bodyData.childId,
            parentId: parentRes.firestore_parentId,
            giftName: bodyData.giftName,
            giftIcon: bodyData.giftIcon || '',
            points: parseInt(bodyData.points),
            isDeleted: false,
            redeemGift: false
        }
        let addGift = await parentService.addGift(giftData);

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.GIFT_ADDED_SUCCESSFULLY);
        } else {
            return response.success(res, 200, message.GIFT_ADDED_SUCCESSFULLY);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child Gift List by Id  //
const childGiftList = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.childId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childGiftListById = await parentService.childGiftListById(bodyData.childId, parentRes.firestore_parentId);

        if (headers.lang == 'ar') {
            return response.data(res, childGiftListById, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, childGiftListById, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  delete Child Gift By Id  //
const deleteChildGiftById = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.GIFT_ID_REQUIRED);
            }
            return response.failure(res, 200, message.GIFT_ID_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let deleteChildGiftById = await parentService.deleteChildGiftById(paramData.id);

        if (headers.lang == 'ar') {
            return response.success(res, 200, arabicMessage.GIFT_DELETED_SUCCESSFULLY);
        } else {
            return response.success(res, 200, message.GIFT_DELETED_SUCCESSFULLY);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  notification list  //
const parentNotificationList = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let notificationList = await parentService.notificationList(parentRes.firestore_parentId);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS)
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  all Parent Notification Delete  //
const allParentNotificationDelete = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentRes = await parentService.findParentByToken(headers.authorization);
        if (!parentRes) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        //  create DB batch to update multiple data  //
        let deleteAllNotification = await parentService.allParentNotificationDelete(parentRes.firestore_parentId);
        let notificationList = await parentService.notificationList(parentRes.firestore_parentId);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  notification Delete By Id  //
const notificationDeleteById = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentData = await parentService.getParentDataById(decoded.id);
        if (!parentData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        };
        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.NOTIFICATION_ID_REQUIRED);
            }
            return response.failure(res, 200, message.NOTIFICATION_ID_REQUIRED);
        }

        let notificationDeleteById = await parentService.notificationDeleteById(paramData.id);
        let notificationList = await parentService.notificationList(decoded.id);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  accept/Reject Gift Request from child by Id  //
const acceptRejectGiftRequest = async (res, headers, paramData, queryData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 200, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentData = await parentService.getParentDataById(decoded.id);
        if (!parentData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 200, message.INVALID_TOKEN);
        };
        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.NOTIFICATION_ID_REQUIRED);
            }
            return response.failure(res, 200, message.NOTIFICATION_ID_REQUIRED);
        }
        if (!queryData.status) {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.ACCEPT_STATUS_REQUIRED);
            }
            return response.failure(res, 200, message.ACCEPT_STATUS_REQUIRED);
        }

        const giftNotificationDetails = await parentService.giftNotificationDetails(paramData.id);
        const childData = await parentService.getChildDataById(giftNotificationDetails.senderId);

        if (giftNotificationDetails.notificationStatus == 'rejected') {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.GIFT_REJECTED);
            }
            return response.failure(res, 200, message.GIFT_REJECTED);
        }

        if (giftNotificationDetails.notificationStatus == 'accepted') {
            if (headers.lang == 'ar') {
                return response.failure(res, 200, arabicMessage.GIFT_ACCEPTED);
            }
            return response.failure(res, 200, message.GIFT_ACCEPTED);
        }

        if (queryData.status == 'rejected') {
            //  send gift rejected notification to child  //
            let giftRequestRejectedNotification = await notificationData.giftRequestRejectedNotification(childData, parentData, giftNotificationDetails);

            let updatedData = { notificationStatus: 'rejected' }
            let updateNotification = await parentService.updateNotificationById(paramData.id, updatedData);

            let finalPoint = parseInt(childData.points) + parseInt(giftNotificationDetails.giftPoint)
            let updatedchildData = { points: finalPoint }
            let updateChildDataById = await parentService.updateChildDataById(childData.childId, updatedchildData)

            if (headers.lang == 'ar') {
                return response.success(res, 200, arabicMessage.GIFT_REJECTED_SUCCESSFULLY);
            } else {
                return response.success(res, 200, message.GIFT_REJECTED_SUCCESSFULLY);
            }
        }

        if (queryData.status == 'accepted') {
            //  send gift accepted notification to child  //
            let giftRequestAcceptedNotification = await notificationData.giftRequestAcceptedNotification(childData, parentData, giftNotificationDetails);

            let updatedData = { notificationStatus: 'accepted' }
            let updateNotification = await parentService.updateNotificationById(paramData.id, updatedData)

            if (headers.lang == 'ar') {
                return response.success(res, 200, arabicMessage.GIFT_ACCEPTED_SUCCESSFULLY);
            } else {
                return response.success(res, 200, message.GIFT_ACCEPTED_SUCCESSFULLY);
            }
        }

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  refresh FcmToken  //
const refreshFcmToken = async (res, bodyData, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }
        if (!bodyData.fcmToken) {
            return response.failure(res, 200, message.REQUIRE_FCM);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let parentData = await parentService.getParentDataById(decoded.id);
        if (!parentData) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        };

        let updatedData = { fcmToken: bodyData.fcmToken }
        let updateParentData = await parentService.updateParentDataById(parentData.parentId, updatedData)

        return response.success(res, 200, message.SUCCESS)
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
    updateParentProfile,
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
    parentNotificationList,
    allParentNotificationDelete,
    notificationDeleteById,
    acceptRejectGiftRequest,
    refreshFcmToken,
}