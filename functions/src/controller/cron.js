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
const resetTimeSpent = async () => {
    try {
        var mydate = new Date();
        var weekDayName = moment(mydate).format('dddd');
        console.log('22  ==== mydate : ', mydate, '  ==== weekDayName : ', weekDayName);

        let nextDayDate = moment(mydate).add(5, 'm').format();
        var nextDayName = moment(nextDayDate).format('dddd');
        console.log('26  ==== nextDayDate : ', nextDayDate, '  ====  weekDayName : ', nextDayName);

        let previousDayDate = moment(mydate).subtract(5, 'm').format();
        var previousDayName = moment('2022-09-08T08:19:57+00:00').format('dddd');
        console.log('29  ==== previousDayDate : ', previousDayDate, '  ==== previousDayName : ', previousDayName);

        let settings = await cronService.getSettings();
        let unFavorableAppAddPointPerMinute = parseInt(settings.unFavorableAppAddPoint) / parseInt(settings.unFavorableAppTime);
        let favorableAppAddPointPerMinute = parseInt(settings.favorableAppAddPoint) / parseInt(settings.favorableAppTime);
        let deviceAddPointPerMinute = parseInt(settings.deviceAddPoint) / parseInt(settings.deviceTime);
        console.log('35  ====  unFavorableAppAddPointPerMinute : ', parseFloat(unFavorableAppAddPointPerMinute), ' ==== favorableAppAddPointPerMinute :', parseFloat(favorableAppAddPointPerMinute), ' ==== deviceAddPointPerMinute : ', parseFloat(deviceAddPointPerMinute));

        if (previousDayName != nextDayName) {
            const getAllConnectedDeviceData = await cronService.getAllConnectedDeviceData();
            if (getAllConnectedDeviceData.length > 0) {

                for (let deviceData of getAllConnectedDeviceData) {
                    const getConnectedDeviceAppData = await cronService.getConnectedDeviceAppData(deviceData.deviceId)

                    //  calculate usage time and add point on less usage ====>>>  APP  //  ( 0: UNFAVORABLE , 1: FAVORABLE )
                    for (let appData of getConnectedDeviceAppData) {
                        const childData = await cronService.getChildDataById(deviceData.childId)

                        let timeSpent = 0;
                        let scheduledTime = 0;

                        if (appData.status == 0) {
                            if (appData.scheduledBy == 'eachDay') {
                                let dateDetails = await appData.eachDaySchedule.filter(element => { return (element.day == previousDayName.toLocaleLowerCase()) });
                                if (dateDetails.length > 0) {
                                    scheduledTime = dateDetails[0].time;
                                    timeSpent = parseInt(appData.timeSpent);
                                }
                                console.log('58  ==== scheduledTime : ', scheduledTime, '  ==== timeSpent : ', timeSpent);
                            }

                            if (appData.scheduledBy == 'everyDay') {
                                scheduledTime = appData.everyDaySchedule;
                                timeSpent = parseInt(appData.timeSpent);
                                console.log('65  ==== scheduledTime : ', scheduledTime, '  ==== timeSpent : ', timeSpent);
                            }

                            if (parseInt(timeSpent) < parseInt(scheduledTime)) {
                                let extraRemainingTime = parseInt(scheduledTime) - parseInt(timeSpent)
                                let extraPointAmount = parseInt(extraRemainingTime) * parseFloat(unFavorableAppAddPointPerMinute);
                                let totalPoint = parseInt(childData.points) + parseInt(extraPointAmount);
                                let updatedData = { points: totalPoint }
                                console.log("73  ==== extraRemainingTime : ", extraRemainingTime, '  ==== extraPointAmount : ', extraPointAmount);

                                let updateChildDataById = await cronService.updateChildDataById(deviceData.childId, updatedData)
                            }
                        }

                        if (appData.status == 1) {
                            if (appData.scheduledBy == 'eachDay') {
                                let dateDetails = await appData.eachDaySchedule.filter(element => { return (element.day == previousDayName.toLocaleLowerCase()) });
                                if (dateDetails.length > 0) {
                                    scheduledTime = dateDetails[0].time;
                                    timeSpent = parseInt(appData.timeSpent);
                                    console.log('89  ==== scheduledTime : ', scheduledTime, '  ==== timeSpent : ', timeSpent);
                                }
                            }

                            if (appData.scheduledBy == 'everyDay') {
                                scheduledTime = appData.everyDaySchedule;
                                timeSpent = parseInt(appData.timeSpent);
                                console.log('97  ==== scheduledTime : ', scheduledTime, '  ==== timeSpent : ', timeSpent);
                            }

                            if (parseInt(timeSpent) < parseInt(scheduledTime)) {
                                let extraRemainingTime = parseInt(scheduledTime) - parseInt(timeSpent)
                                let extraPointAmount = parseInt(extraRemainingTime) * parseFloat(favorableAppAddPointPerMinute);
                                let totalPoint = parseInt(childData.points) + parseInt(extraPointAmount);
                                let updatedData = { points: totalPoint }
                                console.log("105  ==== extraRemainingTime : ", extraRemainingTime, '  ==== extraPointAmount : ', extraPointAmount);

                                let updateChildDataById = await cronService.updateChildDataById(deviceData.childId, updatedData)
                            }
                        }
                    }
                    console.log('%%%%%%%%%%%%%%%%%%%%%%%% deviceData : ', deviceData);
                    //  calculate usage time and add point on less usage ====>>>  DEVICE  //
                    let deviceTimeSpent = 0;
                    let scheduledTime = 0;
                    const childDetails = await cronService.getChildDataById(deviceData.childId)

                    if (deviceData.scheduledBy == 'eachDay') {
                        console.log('??????????????????????????');
                        let dateDetails = await deviceData.eachDaySchedule.filter(element => { return (element.day == previousDayName.toLocaleLowerCase()) });
                        if (dateDetails.length > 0) {
                            scheduledTime = dateDetails[0].time;
                            deviceTimeSpent = parseInt(deviceData.timeSpent);
                            console.log('120  ==== scheduledTime : ', scheduledTime, '  ==== deviceTimeSpent : ', deviceTimeSpent);
                        }
                    }

                    if (deviceData.scheduledBy == 'everyDay') {
                        console.log('&&&&&&&&&&&&&&&&&&&&&&&');
                        scheduledTime = deviceData.everyDaySchedule;
                        deviceTimeSpent = parseInt(deviceData.timeSpent);
                        console.log('128  ==== scheduledTime : ', scheduledTime, '  ==== deviceTimeSpent : ', deviceTimeSpent);
                    }

                    if (parseInt(deviceTimeSpent) < parseInt(scheduledTime)) {
                        let extraRemainingTime = parseInt(scheduledTime) - parseInt(deviceTimeSpent)
                        let extraPointAmount = parseInt(extraRemainingTime) * parseFloat(deviceAddPointPerMinute)
                        let totalPoint = parseInt(childDetails.points) + parseInt(extraPointAmount);
                        let updatedData = { points: totalPoint }
                        console.log("136  ==== extraRemainingTime : ", extraRemainingTime, '  ==== extraPointAmount : ', extraPointAmount);

                        let updateChildDataById = await cronService.updateChildDataById(deviceData.childId, updatedData)
                    }

                    let updateDeviceTimeSpentById = await cronService.updateDeviceTimeSpentById(deviceData.firestoreDeviceId);
                    let updateDeviceAppsById = await cronService.updateDeviceAppsById(deviceData.deviceId)
                }

            }
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@');
            // const updateAllDeviceTimeSpent = await cronService.updateAllDeviceTimeSpent();
            // const updateAllAppTimeSpent = await cronService.updateAllAppTimeSpent()
        }

        return ("148  ========= Cron Success :");

    } catch (error) {
        return ("152  ========= Cron Error :", error);
    }
}





module.exports = {
    resetTimeSpent,
}