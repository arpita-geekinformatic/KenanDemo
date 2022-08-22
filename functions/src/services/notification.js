const firebaseAdmin = require("../utils/firebase");
const parentService = require("./parentService");
const moment = require("moment");
const notificationService = require('./notificationService');
const notificationType = {
    type1: 1,      //  for open notification
    type2: 2,     //  child app usage limit notification
    type3: 3,     //  link device notification (no action)
    type4: 4,     //  for child notification
}



//   CHILD NOTIFICATION   //
//  send app usage change notification  //
const sendAppUsageNotification = async (bodyData, updateData, topic) => {
    try {
        const message = {
            data: {
                title: `Your app usage has been changed by parent.`,
                body: `Your app usage has been changed by parent.`,
                notificationType: `visible`,
                packageName: `${bodyData.packageName}`,
                status: `${updateData.status}`,
                scheduledBy: `${bodyData.scheduledBy}`,
                eachDaySchedule: `${updateData.eachDaySchedule}`,
                everyDaySchedule: `${updateData.everyDaySchedule}`
            },
            topic: topic
        };
        await firebaseAdmin.firebaseSendTopicNotification(message);
        return true;
    } catch (error) {
        throw error;
    }
}

//  send device usage change notification  //
const sendDeviceUsageNotification = async (bodyData, updateData, topic) => {
    try {
        const message = {
            data: {
                title: `Your device usage has been changed by parent.`,
                body: `Your device usage has been changed by parent.`,
                notificationType: `visible`,
                // packageName: `${bodyData.packageName}`,
                // status: `${updateData.status}`,
                scheduledBy: `${bodyData.scheduledBy}`,
                eachDaySchedule: `${updateData.eachDaySchedule}`,
                everyDaySchedule: `${updateData.everyDaySchedule}`
            },
            topic: topic
        };
        await firebaseAdmin.firebaseSendTopicNotification(message);
        return true;
    } catch (error) {
        throw error;
    }
}



//   PARENT NOTIFICATION   //
//  send app Remaining Time Reached Notification  //
const appRemainingTimeReachedNotification = async (childData, childAppDetails, parentData) => {
    try {
        const message = {
            token: parentData.fcmToken,
            data: {
                title: `${childData.name} has reached usage limit of app ${childAppDetails.appName}.`,
                body: `${childData.name} has reached usage limit of app ${childAppDetails.appName}.`,
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
}