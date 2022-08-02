const services = require("../services/firebase");
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


//  parent sign up  //
const signUp = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }
        if (!bodyData.password) {
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }

        let isParentExists = await services.isParentExists(bodyData.email);
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
        }
        let createParentProfile = await services.createParentProfile(newData);

        //  create activation link
        let activationLink = process.env.BASE_URL + "activeAccount/" + createParentProfile;
        console.log("********** activationLink : ", activationLink);

        //  Get email template to send email
        let messageHtml = await ejs.renderFile(process.cwd() + "/src/views/activationEmail.ejs", { link: activationLink }, { async: true });

        let mailResponse = MailerUtilities.sendSendgridMail({ recipient_email: [bodyData.email], subject: "Account Activation", text: messageHtml });



        return response.success(res, 200, `Your account activation mail was sent to your email address.`);
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

        const parentData = await services.getParentDataByEmail(bodyData.email);
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
            isActive: parentData.isActive,
            isDeleted: parentData.isDeleted,
            authToken: authToken,
        }
        const updatePatrentData = await services.updateParentDataById(parentData.firestore_parentId, newData);

        return res.send({ responseCode: 200, status: true, message: "success", data: parentData });


    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  log out  //
const logOut = async (res, bodyData) => {
    try {
        const decoded = await KenanUtilities.decryptToken(bodyData.token);
        let userData = await services.getParentByEmailandUpdate(decoded.email);
        return response.success(res, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}


module.exports = {
    signUp,
    login,
    logOut,
}