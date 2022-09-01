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
        console.log("********* mydate : ", mydate);
        var weekDayName = moment(mydate).format('dddd');
        console.log("********* weekDayName : ", weekDayName);

        let nextDayDate = moment(mydate).add(5, 'm').format()
        console.log("???????????? nextDayDate : ", nextDayDate);
        var nextDayName = moment(nextDayDate).format('dddd');
        console.log("?????????? weekDayName : ", nextDayName);

        let previousDayDate = moment(mydate).subtract(5, 'm').format()
        console.log(">>>>>>>>>>> previousDayDate : ", previousDayDate);
        var previousDayName = moment('2022-08-31T08:19:57+00:00').format('dddd');
        console.log(">>>>>>>>>>>>>>> previousDayName : ", previousDayName);

        const pointAddSettings = 5;

        if (previousDayName != nextDayName) {
            const getAllConnectedDeviceData = await cronService.getAllConnectedDeviceData();
            if (getAllConnectedDeviceData.length > 0) {

                for (let deviceData of getAllConnectedDeviceData) {
                    const getConnectedDeviceAppData = await cronService.getConnectedDeviceAppData(deviceData.deviceId)
                    const childData = await cronService.getChildDataById(deviceData.childId)

                    //  calculate usage time and add point on less usage ====>>>  APP  //
                    for (let appData of getConnectedDeviceAppData) {
                        let timeSpent = 0;
                        let appRemainingTime = 0;

                        if (appData.scheduledBy == 'eachDay') {
                            let dateDetails = await appData.eachDaySchedule.filter(element => { return (element.day == previousDayName.toLocaleLowerCase()) });
                            if (dateDetails.length > 0) {
                                let scheduledTime = dateDetails[0].time;
                                timeSpent = parseInt(appData.timeSpent);
                                appRemainingTime = parseInt(scheduledTime) - parseInt(timeSpent);
                            }
                        }

                        if (appData.scheduledBy == 'everyDay') {
                            let scheduledTime = appData.everyDaySchedule;
                            timeSpent = parseInt(appData.timeSpent);
                            appRemainingTime = parseInt(scheduledTime) - parseInt(timeSpent);
                        }
                      
                        if (parseInt(timeSpent) < parseInt(appRemainingTime)) {
                            let extraRemainingTime = parseInt(appRemainingTime) - parseInt(timeSpent)
                            let extraPointAmount = parseInt(extraRemainingTime) / pointAddSettings;
                            console.log("=========== appRemainingTime : ",appRemainingTime);
                            console.log("========= extraPointAmount : ",extraPointAmount);
                            let totalPoint = parseInt(childData.points) + parseInt(extraPointAmount);
                            let updatedData = { points: totalPoint }
                            
                            let updateChildDataById = await cronService.updateChildDataById(deviceData.childId, updatedData)
                        }
                    }

                    //  calculate usage time and add point on less usage ====>>>  DEVICE  //
                    let deviceTimeSpent = 0;
                    let deviceRemainingTime = 0;

                    if (deviceData.scheduledBy == 'eachDay') {
                        let dateDetails = await deviceData.eachDaySchedule.filter(element => { return (element.day == previousDayName.toLocaleLowerCase()) });
                        if (dateDetails.length > 0) {
                            let scheduledTime = dateDetails[0].time;
                            deviceTimeSpent = parseInt(deviceData.timeSpent);
                            deviceRemainingTime = parseInt(scheduledTime) - parseInt(deviceTimeSpent);
                        }
                    }

                    if (deviceData.scheduledBy == 'everyDay') {
                        let scheduledTime = deviceData.everyDaySchedule;
                        deviceTimeSpent = parseInt(deviceData.timeSpent);
                        deviceRemainingTime = parseInt(scheduledTime) - parseInt(deviceTimeSpent);
                        console.log('94 ***** scheduledTime : ', scheduledTime, ' deviceTimeSpent : ',deviceTimeSpent,"  deviceRemainingTime : ",deviceRemainingTime);
                    }

                    if (parseInt(deviceTimeSpent) < parseInt(deviceRemainingTime)) {
                        let extraRemainingTime = parseInt(deviceRemainingTime) - parseInt(deviceTimeSpent)
                        let extraPointAmount = parseInt(extraRemainingTime) / pointAddSettings
                        console.log('??????????/ extraPointAmount : ',extraPointAmount);
                        let totalPoint = parseInt(childData.points) + parseInt(extraPointAmount);
                        let updatedData = { points: totalPoint }
                        console.log("<<<<<< updatedData : ",updatedData);
                        let updateChildDataById = await cronService.updateChildDataById(deviceData.childId, updatedData)
                    }
                }

            }


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