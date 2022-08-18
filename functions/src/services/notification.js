const firebaseAdmin = require("../utils/firebase");
const parentService = require("./parentService");
const moment = require("moment");
const notificationType = {
    type1: 1,      //  for open notification
    type2: 2,     //  unlink requst notification (only accept / reject)
    type3: 3,     //  link device notification (no action)
    type4: 4,     //  for child notification
}



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



module.exports = {
    sendAppUsageNotification,

}