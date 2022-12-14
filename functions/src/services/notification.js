const firebaseAdmin = require("../utils/firebase");
const parentService = require("./parentService");
const moment = require("moment");
const notificationService = require('./notificationService');
const notificationType = {
    type1: 1,      //  for accept/reject notification
    type2: 2,     //  child app usage limit notification
    type3: 3,     //  link device notification (no action)
    type4: 4,     //  for child notification
}



//   CHILD NOTIFICATION   //
//  send app usage changed by parent notification  // (Type => type2)
const sendAppUsageNotification = async (bodyData, updateData, childData, parentData, childFcmToken) => {
    try {
        const message = {
            token: childFcmToken,
            'notification': {
                'title': `Your app usage has been changed by parent.`,
                'body': `Your app usage has been changed by parent.`,
            },
            'data': {
                'title': `Your app usage has been changed by parent.`,
                'body': `Your app usage has been changed by parent.`,
                'notificationType': `${notificationType.type2}`,
            },
        };
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("31 ===== add APP goal notificationResult : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: parentData.firestore_parentId,
            senderImage: parentData.photo || '',
            receiverId: childData.childId,
            receiverImage: childData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: parentData.firestore_parentId,
            senderName: parentData.name || '',
            receiverId: childData.childId,
            receiverName: childData.name || '',
            actionPerformed_byId: parentData.firestore_parentId,
            actionPerformed_byName: parentData.name || '',
            actionDetails: `App usage of child ${childData.name} has been changed by parent.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true;
    } catch (error) {
        throw error;
    }
}

//  send device usage changed by parent notification  // (Type => type2)
const sendDeviceUsageNotification = async (bodyData, updateData, childData, parentData, childFcmToken) => {
    try {
        const message = {
            token: childFcmToken,
            'notification': {
                'title': `Your device usage has been changed by parent.`,
                'body': `Your device usage has been changed by parent.`,
            },
            'data': {
                'title': `Your device usage has been changed by parent.`,
                'body': `Your device usage has been changed by parent.`,
                'notificationType': `${notificationType.type2}`,
            },
        };
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("84 ===== add DEVICE goal notificationResult : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: parentData.firestore_parentId,
            senderImage: parentData.photo || '',
            receiverId: childData.childId,
            receiverImage: childData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: parentData.firestore_parentId,
            senderName: parentData.name || '',
            receiverId: childData.childId,
            receiverName: childData.name || '',
            actionPerformed_byId: parentData.firestore_parentId,
            actionPerformed_byName: parentData.name || '',
            actionDetails: `Device usage of child ${childData.name} has been changed by parent.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true;
    } catch (error) {
        throw error;
    }
}

//  gift Request Rejected by parent Notification  //  (Type => type1)
const giftRequestRejectedNotification = async (childData, parentData, giftNotificationDetails) => {
    try {
        const message = {
            token: childData.fcmToken,
            'notification': {
                'title': `Your gift request of '${giftNotificationDetails.giftName}' has been rejected by parent.`,
                'body': `Your gift request of '${giftNotificationDetails.giftName}' has been rejected by parent.`,
            },
            'data': {
                'title': `Your gift request of '${giftNotificationDetails.giftName}' has been rejected by parent.`,
                'body': `Your gift request of '${giftNotificationDetails.giftName}' has been rejected by parent.`,
                'notificationType': `${notificationType.type1}`,
            },
        };
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("137 ===== gift Request Rejected notificationResult : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();

        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: parentData.parentId,
            senderImage: parentData.photo || '',
            receiverId: childData.childId,
            receiverImage: childData.photo,
            notificationType: notificationType.type1,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: parentData.parentId,
            senderName: parentData.name || '',
            receiverId: childData.childId,
            receiverName: childData.name || '',
            actionPerformed_byId: parentData.parentId,
            actionPerformed_byName: parentData.name || '',
            actionDetails: `Your gift request of '${giftNotificationDetails.giftName}' has been rejected by parent.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true;

    } catch (error) {
        throw error;
    }
}

//  gift Request Accepted by parent Notification  //  (Type => type1)
const giftRequestAcceptedNotification = async (childData, parentData, giftNotificationDetails) => {
    try {
        const message = {
            token: childData.fcmToken,
            'notification': {
                'title': `Your gift request of '${giftNotificationDetails.giftName}' has been accepted by parent.`,
                'body': `Your gift request of '${giftNotificationDetails.giftName}' has been accepted by parent.`,
            },
            'data': {
                'title': `Your gift request of '${giftNotificationDetails.giftName}' has been accepted by parent.`,
                'body': `Your gift request of '${giftNotificationDetails.giftName}' has been accepted by parent.`,
                'notificationType': `${notificationType.type1}`,
            },
        };
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("192 ===== gift Request Accepted notificationResult : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();

        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: parentData.parentId,
            senderImage: parentData.photo || '',
            receiverId: childData.childId,
            receiverImage: childData.photo,
            notificationType: notificationType.type1,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: parentData.parentId,
            senderName: parentData.name || '',
            receiverId: childData.childId,
            receiverName: childData.name || '',
            actionPerformed_byId: parentData.parentId,
            actionPerformed_byName: parentData.name || '',
            actionDetails: `Your gift request of '${giftNotificationDetails.giftName}' has been accepted by parent.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true;

    } catch (error) {
        throw error;
    }
}

//  device Disconnect Notification  //    (Type => type3)
const deviceDisconnectNotification = async (childData, parentData, fcmToken) => {
    try {
        const message = {
            token: fcmToken,
            'notification': {
                'title': `This device has been disconnected.`,
                'body': `This device has been disconnected.`,
            },
            'data': {
                'title': `This device has been disconnected.`,
                'body': `This device has been disconnected.`,
                'notificationType': `${notificationType.type3}`,
            },
        };
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("247 ===== disconnect notificationResult : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();

        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: parentData.parentId,
            senderImage: parentData.photo || '',
            receiverId: childData.childId,
            receiverImage: childData.photo || '',
            notificationType: notificationType.type3,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: parentData.parentId,
            senderName: parentData.name || '',
            receiverId: childData.childId,
            receiverName: childData.name || '',
            actionPerformed_byId: parentData.parentId,
            actionPerformed_byName: parentData.name || '',
            actionDetails: `This device has been disconnected.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true;

    } catch (error) {
        throw error;
    }
}




//   PARENT NOTIFICATION   //
//  send app Remaining Time Reached Notification  // (Type => type2)
const appRemainingTimeReachedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            'notification': {
                'title': `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
                'body': `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
            },
            'data': {
                'title': `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
                'body': `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
                'notificationType': `${notificationType.type2}`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("306 ==== app Remaining Time Reached Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} has reached usage limit of app ${childAppDetails.appName}.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true
    } catch (error) {
        throw error;
    }
}

//  send device Remaining Time Reached Notification  // (Type => type2)
const deviceRemainingTimeReachedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            'notification': {
                'title': `${childData.name} has reached device usage time limit.`,
                'body': `${childData.name} has reached device usage time limit.`,
            },
            'data': {
                'title': `${childData.name} has reached device usage time limit.`,
                'body': `${childData.name} has reached device usage time limit.`,
                'notificationType': `${notificationType.type2}`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("359 ==== device Remaining Time Reached Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} has  reached device usage time limit.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true
    } catch (error) {
        throw error;
    }
}

//  when only app time limit crossed  // (Type => type2)
const appRemainingTimeCrossedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            'notification': {
                'title': `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
                'body': `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
            },
            'data': {
                'title': `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
                'body': `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
                'notificationType': `${notificationType.type2}`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("412 ==== app time limit crossed Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true
    } catch (error) {
        throw error;
    }
}

//  when only device time limit crossed  // (Type => type2)
const deviceRemainingTimeCrossedNotification = async (childData, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            'notification': {
                'title': `${childData.name} has crossed device usage time limit.`,
                'body': `${childData.name} has crossed device usage time limit.`,
            },
            'data': {
                'title': `${childData.name} has crossed device usage time limit.`,
                'body': `${childData.name} has crossed device usage time limit.`,
                'notificationType': `${notificationType.type2}`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("465 ==== device time limit crossed Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} has crossed device usage time limit.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true
    } catch (error) {
        throw error;
    }
}

//  when both time limit crossed  // (Type => type2)
const bothRemainingTimeCrossedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            'notification': {
                'title': `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit .`,
                'body': `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit.`,
            },
            'data': {
                'title': `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit .`,
                'body': `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit.`,
                'notificationType': `${notificationType.type2}`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("518 ==== both time limit crossed Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type2,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit.`,
            createdAt: utcDate,
            isDeleted: false
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true
    } catch (error) {
        throw error;
    }
}

//  redeem Gift Notification  // (Type => type1)
const requestRedeemGiftNotification = async (childData, parentData, lang, giftDetails) => {
    try {
        var message = {
            token: parentData.fcmToken,
            'data': {
                'title': `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
                'body': `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
                'notificationType': `${notificationType.type1}`,
            },
            "notification": {
                'title': `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
                'body': `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);
        console.log("571 ==== redeem Gift Notification : ", notificationResult);

        var localDate = new Date();
        const utcDate = moment.utc(localDate).format();
        let notificationData = {
            message: message.data,
            childDeviceId: childData.deviceId,
            senderId: childData.childId,
            senderImage: childData.photo,
            receiverId: parentData.parentId,
            receiverImage: parentData.photo,
            notificationType: notificationType.type1,
            messageTime: utcDate,
            isMarked: false,
            isDeleted: false,
            giftName: giftDetails.giftName,
            notificationStatus: "",
            giftPoint: giftDetails.points,
        }
        let saveNotification = await notificationService.addNotification(notificationData);

        let activityLogData = {
            senderId: childData.childId,
            senderName: childData.name,
            receiverId: parentData.parentId,
            receiverName: parentData.name,
            actionPerformed_byId: childData.childId,
            actionPerformed_byName: childData.name,
            actionDetails: `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
            createdAt: utcDate,
            isDeleted: false,
            giftName: giftDetails.giftName,
            giftPoint: giftDetails.points,
        }
        let saveActivity = await notificationService.addActivityLog(activityLogData);

        return true

    } catch (error) {
        throw error;
    }
}


module.exports = {
    sendAppUsageNotification,
    sendDeviceUsageNotification,
    giftRequestRejectedNotification,
    giftRequestAcceptedNotification,
    deviceDisconnectNotification,
    appRemainingTimeReachedNotification,
    deviceRemainingTimeReachedNotification,
    appRemainingTimeCrossedNotification,
    deviceRemainingTimeCrossedNotification,
    bothRemainingTimeCrossedNotification,
    requestRedeemGiftNotification,
}