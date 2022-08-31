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
        console.log("********* mydate : ",mydate);
        var weekDayName = moment(mydate).format('dddd');
        console.log("********* weekDayName : ",weekDayName);

        let nextDayDate = moment(mydate).add(5, 'm').format()
        console.log("???????????? nextDayDate : ",nextDayDate);
        var nextDayName = moment(nextDayDate).format('dddd');
        console.log("?????????? weekDayName : ",nextDayName);

        let previousDayDate = moment(mydate).subtract(5, 'm').format()
        console.log(">>>>>>>>>>> previousDayDate : ",previousDayDate);
        var previousDayName = moment('2022-08-30T08:19:57+00:00').format('dddd');
        console.log(">>>>>>>>>>>>>>> previousDayName : ",previousDayName);


        if(previousDayName != nextDayName){

            // const getAllDeviceData = await 

            // const updateAllDeviceTimeSpent = await cronService.updateAllDeviceTimeSpent();
            // const updateAllAppTimeSpent = await cronService.updateAllAppTimeSpent()
        }
        

        return response.success(res, 200, message.SUCCESS);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}





module.exports = {
    resetTimeSpent,
}