const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();



//   save notification   //
const addNotification = async (notificationData) => {
    try {
        let saveNotification = await db.collection("notifications").add(notificationData);
        return saveNotification.id;
    } catch (error) {
        throw error;
    }
}



//   save activity logs   //
const addActivityLog = async (activityLogData) => {
    try {
        await db.collection("activityLogs").add(activityLogData);
        return true;
    } catch (error) {
        throw error
    }
}



module.exports = {
    addNotification,
    addActivityLog,
}