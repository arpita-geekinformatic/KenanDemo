const childService = require("../services/childService");
const response = require("../utils/response");
const message = require("../utils/message");
const notificationData = require("../services/notification");
const differenceBy = require("lodash/differenceBy");
const KenanUtilities = require("../utils/KenanUtilities");
const firebaseAdmin = require('../utils/firebase');

var deviceKeys = ["deviceId", "deviceName", "parentId", "childId", "versionCode", "listSize", "apps", "model", "fcmToken", "manufacturer", "model"]




//  scan Qr Code  //
const scanQrCode = async (res, bodyData) => {
    try {
        if (!bodyData.parentId) {
            return response.failure(res, 200, message.PARENT_ID_REQUIRED);
        }
        if (!bodyData.childId) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.deviceId) {
            return response.failure(res, 200, message.REQUIRE_CHILD_DEVICE_ID);
        }
        // if (!bodyData.password) {
        //     return response.failure(res, 200, message.PASSWORD_REQUIRED);
        // }
        if (!bodyData.FcmToken) {
            return response.failure(res, 200, message.REQUIRE_FCM);
        }

        let isParentExists = await childService.getParentDataById(bodyData.parentId);
        if (!isParentExists) {
            return response.failure(res, 200, message.INVALID_PARENT_ID);
        }

        let isChildExists = await childService.getChildDataById(bodyData.childId);
        if (!isChildExists) {
            return response.failure(res, 200, message.INVALID_CHILD_ID);
        }

        //  check is child already connected to other device or not  //
        if ((isChildExists.deviceId != "") && (isChildExists.deviceId != bodyData.deviceId)) {
            //  update child data  //
            let updatedChildData = {
                deviceId: "",
                fcmToken: ""
            }
            let updateChildDataById = await childService.updateChildDataById(bodyData.childId, updatedChildData);

            //  unlink connected device  //
            let connectedDeviceData = await childService.isDeviceExists(isChildExists.deviceId);
            let updatedDeviceData = {
                childId: "",
                parentId: ""
            }
            let updateDeviceData = await childService.updateDeviceDataById(connectedDeviceData.firestoreDevicePathId, updatedDeviceData);
        }


        let isDeviceExists = await childService.isDeviceExists(bodyData.deviceId);
        if (!isDeviceExists) {
            console.log(">>>>>>>>>>>>>>> if device not exists ");
            let newData = {
                childId: bodyData.childId,
                deviceId: bodyData.deviceId,
                deviceName: "",
                fcmToken: bodyData.FcmToken,
                listSize: 0,
                manufacturer: "",
                model: "",
                parentId: bodyData.parentId,
                versionCode: "",
                scheduledBy: "",
                eachDaySchedule: [],
                everyDaySchedule: "",
            }
            let addDeviceData = await childService.addDeviceData(newData);
        }
        else {
            console.log("===========  if device exists ");
            let newdDeviceData = {
                childId: bodyData.childId,
                parentId: bodyData.parentId,
                fcmToken: bodyData.FcmToken,
                scheduledBy: "",
                eachDaySchedule: [],
                everyDaySchedule: "",
            }
            let updateNewDeviceDataById = await childService.updateDeviceDataById(isDeviceExists.firestoreDevicePathId, newdDeviceData);
        }

        // let hashedPassword = await KenanUtilities.cryptPassword(bodyData.password);
        //  generate child auth token  //
        const authToken = await KenanUtilities.generateChildToken(bodyData.childId, bodyData.deviceId);

        let newChildData = {
            deviceId: bodyData.deviceId,
            fcmToken: bodyData.FcmToken,
            // password: hashedPassword,
            authToken: authToken
        }
        let updateNewChildDataById = await childService.updateChildDataById(bodyData.childId, newChildData);


        //  subscribe child topic with parent  // 
        const registrationTokens = [isParentExists.fcmToken];
        let topic = `child_${bodyData.childId}`;
        let subscribeTopic = await firebaseAdmin.firebaseSubscribeTopicNotification(registrationTokens, topic);

        let finaldata = {
            parentId: bodyData.parentId,
            deviceName: isDeviceExists.deviceName || "",
            childId: bodyData.childId,
            firestoreDeviceId: isDeviceExists.firestoreDevicePathId,
            deviceId: bodyData.deviceId,
            childFcmToken: bodyData.FcmToken,
            parentName: isParentExists.name,
            authToken: authToken,
        };
        return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data: finaldata });

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Child  // 
const addDeviceApps = async (res, reqBodyData) => {
    try {
        if (!reqBodyData.deviceId) {
            return response.failure(res, 200, message.REQUIRE_CHILD_DEVICE_ID);
        }

        console.log("======= call 1");
        let bodyData = KenanUtilities.mapToValues(deviceKeys, reqBodyData);
        let isDeviceExists = await childService.isDeviceExists(bodyData.deviceId);
        let firestoreDevicePathId;

        //  If device doesn't exists  // 
        if (!isDeviceExists) {
            console.log("======  If device doesn't exists");

            //  Insert data in Devices   //
            const reqData = bodyData;
            delete bodyData.apps;

            reqData.scheduledBy = "";
            reqData.eachDaySchedule = [];
            reqData.everyDaySchedule = "";

            let addDeviceData = await childService.addDeviceData(reqData);
            let getDeviceDataByFirestoreId = await childService.getDeviceDataByFirestoreId(addDeviceData)
            firestoreDevicePathId = getDeviceDataByFirestoreId.firestoreDevicePathId;

            //  Insert data in Apps  //
            let appArr = reqBodyData.apps;
            appArr.forEach(async (element) => {
                console.log("160 >>>>>>>>>. element.status : ",element.status);
                let getAppByName = await childService.getAppByName(element.appName, element.packageName);
                let firestoreAppId;

                if (!getAppByName) {
                    console.log("=====  APP ADD on IF");
                    let newAppData = {
                        appName: element.appName,
                        packageName: element.packageName,
                        baseImage: element.baseImage
                    }
                    let addNewApp = await childService.addNewApp(newAppData);
                    firestoreAppId = addNewApp;
                }
                else {
                    console.log("====  APP UPDATE on IF");
                    firestoreAppId = getAppByName;
                    let updateAppData = await childService.updateAppData(firestoreAppId, { baseImage: element.baseImage });
                };

                //  Insert data in deviceapps  //
                //  check if app already exists in deviceApps  //
                let isDeviceAppExists = await childService.isDeviceAppExists(firestoreDevicePathId, firestoreAppId);

                if (!isDeviceAppExists) {
                    console.log("=====  Device App ADD IF NOT EXISTS");
                    let newDeviceAppData = {
                        appName: element.appName || '',
                        packageName: element.packageName || '',
                        firestoreAppId: firestoreAppId,
                        deviceId: bodyData.deviceId,
                        status: element.status || 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        // phoneTimeLimit: element.phoneTimeLimit || 1800,
                        // dailyTimeLimit: element.individualAppTimeLimit || 0,
                        timeSpent: element.timeSpent || '00',
                        // usageTimeOnDays: element.usageTimeOnDays || '',
                        scheduledBy: element.scheduledBy || '',
                        eachDaySchedule: element.eachDaySchedule || [],
                        everyDaySchedule: element.everyDaySchedule || '',
                    }
                    let addDeviceAppData = await childService.addDeviceAppData(newDeviceAppData);
                }
                else {
                    console.log("===== Device App UPDATE IF EXISTS");
                    let updatedDeviceAppData = {
                        appName: isDeviceAppExists.appName ? isDeviceAppExists.appName : element.appName,
                        packageName: isDeviceAppExists.packageName ? isDeviceAppExists.packageName : element.packageName,
                        firestoreAppId: firestoreAppId,
                        deviceId: isDeviceAppExists.deviceId ? isDeviceAppExists.deviceId : req.body.deviceId,
                        status: element.status ? element.status : isDeviceAppExists.status ? isDeviceAppExists.status : 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        // phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        // dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        timeSpent: isDeviceAppExists.timeSpent ? isDeviceAppExists.timeSpent : element.timeSpent ? element.timeSpent : '00',
                        // usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
                        scheduledBy: isDeviceAppExists.scheduledBy ? isDeviceAppExists.scheduledBy : element.scheduledBy,
                        eachDaySchedule: isDeviceAppExists.eachDaySchedule ? isDeviceAppExists.eachDaySchedule : element.eachDaySchedule,
                        everyDaySchedule: isDeviceAppExists.everyDaySchedule ? isDeviceAppExists.everyDaySchedule : element.everyDaySchedule,
                    }
                    let updateDeviceAppDataById = await childService.updateDeviceAppDataById(isDeviceAppExists.firestoreDeviceAppId, updatedDeviceAppData);
                }
            })
        }

        //  If device already exists  //
        else {
            console.log("**********  ELSE device already exists");
            firestoreDevicePathId = isDeviceExists.firestoreDevicePathId;
            let newData = {
                fcmToken: bodyData.fcmToken,
            }
            let updateDeviceDataById = await childService.updateDeviceDataById(firestoreDevicePathId, newData);

            //  Insert new Apps  //
            let appArr = reqBodyData.apps;
            appArr.forEach(async (element) => {
                console.log("160 >>>>>>>>>. element.status : ",element.status);
                let getAppByName = await childService.getAppByName(element.appName, element.packageName);
                let firestoreAppId;

                if (!getAppByName) {
                    console.log("*****  APP ADD on ELSE");
                    let newAppData = {
                        appName: element.appName,
                        packageName: element.packageName,
                        baseImage: element.baseImage
                    }
                    let addNewApp = await childService.addNewApp(newAppData);
                    firestoreAppId = addNewApp;
                }
                else {
                    console.log("*****  APP UPDATE on ELSE");
                    firestoreAppId = getAppByName;
                    let updateAppData = await childService.updateAppData(firestoreAppId, { baseImage: element.baseImage });
                };

                //  Insert data in deviceapps  //
                //  check if app already exists in deviceApps  //
                let isDeviceAppExists = await childService.isDeviceAppExists(firestoreDevicePathId, firestoreAppId);

                if (!isDeviceAppExists) {
                    console.log("******  Device App ADD IF NOT EXISTS");
                    let newDeviceAppData = {
                        appName: element.appName || '',
                        packageName: element.packageName || '',
                        firestoreAppId: firestoreAppId,
                        deviceId: bodyData.deviceId,
                        status: element.status || 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        // phoneTimeLimit: element.phoneTimeLimit || 1800,
                        // dailyTimeLimit: element.individualAppTimeLimit || 0,
                        timeSpent: element.timeSpent || '00',
                        // usageTimeOnDays: element.usageTimeOnDays || '',
                        scheduledBy: element.scheduledBy || '',
                        eachDaySchedule: element.eachDaySchedule || [],
                        everyDaySchedule: element.everyDaySchedule || '',
                    }
                    let addDeviceAppData = await childService.addDeviceAppData(newDeviceAppData);
                }
                else {
                    console.log("******  Device App UPDATE IF EXISTS");
                    let updatedDeviceAppData = {
                        appName: isDeviceAppExists.appName ? isDeviceAppExists.appName : element.appName,
                        packageName: isDeviceAppExists.packageName ? isDeviceAppExists.packageName : element.packageName,
                        firestoreAppId: firestoreAppId,
                        deviceId: isDeviceAppExists.deviceId ? isDeviceAppExists.deviceId : req.body.deviceId,
                        status: element.status ? element.status : isDeviceAppExists.status ? isDeviceAppExists.status : 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        // phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        // dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        timeSpent: isDeviceAppExists.timeSpent ? isDeviceAppExists.timeSpent : element.timeSpent ? element.timeSpent : '00',
                        // usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
                        scheduledBy: isDeviceAppExists.scheduledBy ? isDeviceAppExists.scheduledBy : element.scheduledBy,
                        eachDaySchedule: isDeviceAppExists.eachDaySchedule ? isDeviceAppExists.eachDaySchedule : element.eachDaySchedule,
                        everyDaySchedule: isDeviceAppExists.everyDaySchedule ? isDeviceAppExists.everyDaySchedule : element.everyDaySchedule,
                    }
                    let updateDeviceAppDataById = await childService.updateDeviceAppDataById(isDeviceAppExists.firestoreDeviceAppId, updatedDeviceAppData);
                }
            })
        }

        let data = {
            firestore_deviceId: firestoreDevicePathId,
            deviceId: reqBodyData.deviceId
        }
        return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data });
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get child details  //
const childDetails = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        const childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childDeviceData = await childService.isDeviceExists(childData.deviceId);
        childData.scheduledBy = childDeviceData.scheduledBy || '';
        childData.eachDaySchedule = childDeviceData.eachDaySchedule || [];
        childData.everyDaySchedule = childDeviceData.everyDaySchedule || '';

        return response.data(res, childData, 200, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child Device App List for child  //
const deviceAppListByChild = async (res, headers) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 200, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        let childDeviceAppList = await childService.childDeviceAppList(childData.deviceId)
        return response.data(res, childDeviceAppList, 200, message.SUCCESS);

    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  update child device and app usage  //
const updateUsageTime = async (res, headers, bodyData) => {
    try {
        if (!headers.authorization) {
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            return response.failure(res, 400, message.INVALID_TOKEN);
        };
        if (!bodyData.type) {
            return response.failure(res, 400, message.TYPE_IS_REQUIRED)
        };
        let parentData = await childService.getParentDataById(childData.parentId);

        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
        const day = new Date().getDay();

        //  update both app and device usage time  //
        if (bodyData.type == 'appUsage') {
            if (!bodyData.packageName) {
                return response.failure(res, 400, message.REQUIRE_PACKAGE_NAME);
            }
            if (!bodyData.timeSpent) {
                return response.failure(res, 400, message.TIME_SPENT_REQUIRED);
            }

            //   calculate and update app remaining time  // 
            const childAppDetails = await childService.childAppDetailsByPackageName(childData.deviceId, bodyData.packageName);
            // console.log(">>>>>>>>>>>>>>> childAppDetails : ", childAppDetails);
            let appRemainingTime = '00';
            let totalAppTimeSpent = childAppDetails.timeSpent || '00';

            if (childAppDetails.scheduledBy == 'eachDay') {
                let dateDetails = await childAppDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(bodyData.timeSpent);
                    appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
                }
            }

            if (childAppDetails.scheduledBy == 'everyDay') {
                let scheduledTime = childAppDetails.everyDaySchedule;
                totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(bodyData.timeSpent);
                appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
            }

            let newData = {
                timeSpent: `${totalAppTimeSpent}`,
                remainingTime: `${appRemainingTime}`
            }
            console.log(">>>>>>>>>>>>>>> app newData :", newData);
            let updateChildAppDetails = await childService.updateDeviceAppDataById(childAppDetails.firestoreDeviceAppId, newData);

            //  calculate and update device remaining time  //
            let deviceDetails = await childService.getDeviceDataByFirestoreId(childAppDetails.firestoreDeviceId);
            // console.log(">>>>>>>>>>>>>>>>> deviceDetails : ", deviceDetails);
            let deviceRemainingTime = '00';
            let totalTimeSpent = deviceDetails.timeSpent || '00';

            if (deviceDetails.scheduledBy == 'eachDay') {
                let dateDetails = await deviceDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalTimeSpent = parseInt(totalTimeSpent) + parseInt(bodyData.timeSpent)
                    deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
                }
            }

            if (deviceDetails.scheduledBy == 'everyDay') {
                let scheduledTime = deviceDetails.everyDaySchedule;
                totalTimeSpent = parseInt(totalTimeSpent) + parseInt(bodyData.timeSpent);
                deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
            }

            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log(">>>>>>>>>>>>>>>> device newData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);


            //  send notification to parent about usage time  //
            //  when app time limit reached  //
            if ((parseInt(newData.remainingTime) == 0) && (parseInt(newDeviceData.remainingTime > 0))) {
                let appRemainingTimeReachedNotification = await notificationData.appRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("++++++++++++ appRemainingTimeReachedNotification : ");
            }
            //  when device time limit reached  //
            if (parseInt(newDeviceData.remainingTime == 0) && (parseInt(newData.remainingTime) > 0)) {
                let deviceRemainingTimeReachedNotification = await notificationData.deviceRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("++++++++++++ deviceRemainingTimeReachedNotification : ");
            }

            //  when only app time limit crossed  //
            if ((parseInt(newData.remainingTime) < 0) && (parseInt(newDeviceData.remainingTime) >= 0)) {
                let appRemainingTimeCrossedNotification = await notificationData.appRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("++++++++++++ appRemainingTimeCrossedNotification : ");
            }

            //  when only device time limit crossed  //
            if ((parseInt(newData.remainingTime) >= 0) && (parseInt(newDeviceData.remainingTime) < 0)) {
                let deviceRemainingTimeCrossedNotification = await notificationData.deviceRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("++++++++++++ deviceRemainingTimeCrossedNotification : ");
            }

            //  when both time limit crossed  //
            if((parseInt(newData.remainingTime) < 0) && (parseInt(newDeviceData.remainingTime) < 0)){
                let bothRemainingTimeCrossedNotification = await notificationData.bothRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("++++++++++++ bothRemainingTimeCrossedNotification : ");
            }

        }

        //  update only device usage time  //
        if (bodyData.type == 'deviceUsage') {
            if (!bodyData.timeSpent) {
                return response.failure(res, 400, message.TIME_SPENT_REQUIRED);
            }

            let deviceDetails = await childService.isDeviceExists(childData.deviceId);
            let deviceRemainingTime = '00';
            let totalTimeSpent = deviceDetails.timeSpent || '00';
            // console.log("================= deviceDetails : ",deviceDetails);

            if (deviceDetails.scheduledBy == 'eachDay') {
                let dateDetails = await deviceDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalTimeSpent = parseInt(totalTimeSpent) + parseInt(bodyData.timeSpent)
                    deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
                }
            }

            if (deviceDetails.scheduledBy == 'everyDay') {
                let scheduledTime = deviceDetails.everyDaySchedule;
                totalTimeSpent = parseInt(totalTimeSpent) + parseInt(bodyData.timeSpent);
                deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
            }

            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log("================ device newData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);
        }



        return response.success(res, 200, message.SUCCESS)
    } catch (error) {
        return response.failure(res, 400, error);
    }
}





module.exports = {
    addDeviceApps,
    scanQrCode,
    childDetails,
    deviceAppListByChild,
    updateUsageTime,
}