const cronService = require("../services/cronService");
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



//  cron to reset time spent of all device at midnight  //
const resetTimeSpent = async (res) => {
    try {

        var mydate = new Date();
        var weekDayName = moment(mydate).format('dddd');
        console.log(">>>>>>>>>>>>>>> weekDayName : ",weekDayName);




        return response.success(res, 200, message.SUCCESS);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}





module.exports = {
    resetTimeSpent,
}