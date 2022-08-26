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
//  send app usage change notification  // (Type => type2)
const sendAppUsageNotification = async (bodyData, updateData, topic, childData, parentData) => {
    try {
        const message = {
            data: {
                title: `Your app usage has been changed by parent.`,
                body: `Your app usage has been changed by parent.`,
                notificationType: `visible`,
            },
            topic: topic
        };
        await firebaseAdmin.firebaseSendTopicNotification(message);

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

//  send device usage change notification  // (Type => type2)
const sendDeviceUsageNotification = async (bodyData, updateData, topic, childData, parentData) => {
    try {
        const message = {
            data: {
                title: `Your device usage has been changed by parent.`,
                body: `Your device usage has been changed by parent.`,
                notificationType: `visible`,
            },
            topic: topic
        };
        await firebaseAdmin.firebaseSendTopicNotification(message);

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



//   PARENT NOTIFICATION   //
//  send app Remaining Time Reached Notification  // (Type => type2)
const appRemainingTimeReachedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            data: {
                title: `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
                body: `${childData.name} has reached usage time limit of app ${childAppDetails.appName}.`,
                notificationType: notificationType.type2,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
            data: {
                title: `${childData.name} has reached device usage time limit.`,
                body: `${childData.name} has reached device usage time limit.`,
                notificationType: notificationType.type2,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
            data: {
                title: `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
                body: `${childData.name} has crossed usage time limit of app ${childAppDetails.appName}.`,
                notificationType: notificationType.type2,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
            data: {
                title: `${childData.name} has crossed device usage time limit.`,
                body: `${childData.name} has crossed device usage time limit.`,
                notificationType: notificationType.type2,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
            data: {
                title: `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit .`,
                body: `${childData.name} has crossed both device and app ${childAppDetails.appName} usage time limit.`,
                notificationType: notificationType.type2,
            }
        }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
        // if (lang == 'ar') {
        //     var message = {
        //         token: parentData.fcmToken,
        //         data: {
        //             title: `${childData.name} يريد استرداد الهدية: ${giftDetails.giftName}.`,
        //             body: `${childData.name} يريد استرداد الهدية: ${giftDetails.giftName}.`,
        //             notificationType: notificationType.type1,
        //         }
        //     }
        // } else {
        var message = {
            token: parentData.fcmToken,
            data: {
                title: `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
                body: `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
                notificationType: notificationType.type1,
            }
        }
        // }
        const notificationResult = await firebaseAdmin.firebaseNotification(message);

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
            actionDetails: `${childData.name} wants to redeem the gift: ${giftDetails.giftName}.`,
            createdAt: utcDate,
            isDeleted: false
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
    appRemainingTimeReachedNotification,
    deviceRemainingTimeReachedNotification,
    appRemainingTimeCrossedNotification,
    deviceRemainingTimeCrossedNotification,
    bothRemainingTimeCrossedNotification,
    requestRedeemGiftNotification,
}