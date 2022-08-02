const services = require("../services/firebase");
const response = require("../utils/response");
const message = require("../utils/message");
const firebaseAdmin = require("../utils/firebase");
const notificationData = require("../services/notification");
const { service } = require("firebase-functions/v1/analytics");
const KenanUtilities = require("../utils/KenanUtilities");



//  parent sign up  //
const signUp = async (res, bodyData) => {
    try {
        if (!bodyData.email) {
            return response.failure(res, 200, message.EMAIL_REQUIRED);
        }

        let isParentExists = await services.isParentExists(bodyData.email);
        if(isParentExists){
            return response.failure(res, 200, message.USER_EXISTS);
        }

        let newData = {
            name: bodyData.name || "",
            email: bodyData.email || "",
            // role: "parent",
            isActive: false,
            isDeleted: false,
            authToken: "",
        }
        let createParentProfile = await services.createParentProfile(newData);
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
       
        // let parentData = await services.getParentByEmail(authenticateUser.email);
        // if (parentData.empty) {
        //     let newData = {
        //         uid: uid,
        //         firebaseResponse: JSON.stringify(authenticateUser),
        //         email: authenticateUser.email,
        //         phone: authenticateUser.phoneNumber ? authenticateUser.phoneNumber : "",
        //         picture: authenticateUser.photoURL ? authenticateUser.photoURL : "",
        //         name: authenticateUser.displayName ? authenticateUser.displayName : bodyData.name,
        //         fcmToken: bodyData.fcmToken ? bodyData.fcmToken : "",
        //         countryCode: bodyData.countryCode ? bodyData.countryCode : "",
        //     }
        //     let newUser = await services.addUser(newData);
        //     let getNewUserData = await services.getParentById(newUser);

        //     const authToken = await KenanUtilities.generateToken(
        //         getNewUserData.name, uid, authenticateUser.email
        //     );

        //     let finaldata = {
        //         picture: getNewUserData.picture,
        //         phone: getNewUserData.phone,
        //         uid: getNewUserData.uid,
        //         email: getNewUserData.email,
        //         name: getNewUserData.name,
        //         id: getNewUserData.id,
        //         dob: getNewUserData.dob,
        //         gender: getNewUserData.gender,
        //         firstName: getNewUserData.firstName,
        //         lastName: getNewUserData.lastName,
        //         token: authToken,
        //         fcmToken: getNewUserData.fcmToken,
        //         countryCode: getNewUserData.countryCode,
        //     }
        //     return response.dataWithToken(res, finaldata, authToken, 200, message.SUCCESS);
        // }
        // else {
        //     parentData.forEach(async (doc) => {
        //         let newData = {
        //             uid: uid,
        //             firebaseResponse: JSON.stringify(authenticateUser),
        //             email: authenticateUser.email,
        //             phone: authenticateUser.phoneNumber ? authenticateUser.phoneNumber : "",
        //             picture: authenticateUser.photoURL ? authenticateUser.photoURL : "",
        //             name: authenticateUser.displayName ? authenticateUser.displayName : doc.data().name,
        //             fcmToken: bodyData.fcmToken ? bodyData.fcmToken : "",
        //         }
        //         let updateUserData = await services.updateParentById(doc.id, newData);
        //         let updatedUserdata = await services.getParentById(doc.id);

        //         const authToken = await KenanUtilities.generateToken(
        //             updatedUserdata.name, uid, authenticateUser.email
        //         );
        //         let finaldata = {
        //             picture: updatedUserdata.picture,
        //             phone: updatedUserdata.phone,
        //             uid: updatedUserdata.uid,
        //             email: updatedUserdata.email,
        //             name: updatedUserdata.name,
        //             id: updatedUserdata.id,
        //             dob: updatedUserdata.dob,
        //             gender: updatedUserdata.gender,
        //             firstName: updatedUserdata.firstName,
        //             lastName: updatedUserdata.lastName,
        //             token: authToken,
        //             fcmToken: updatedUserdata.fcmToken,
        //             countryCode: updatedUserdata.countryCode,
        //         }
        //         return response.dataWithToken(res, finaldata, authToken, 200, message.SUCCESS);
        //     })
        // }
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