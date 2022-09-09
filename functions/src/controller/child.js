const childService = require("../services/childService");
const response = require("../utils/response");
const message = require("../utils/message");
const arabicMessage = require("../utils/arabicMessage");
const notificationData = require("../services/notification");
const differenceBy = require("lodash/differenceBy");
const KenanUtilities = require("../utils/KenanUtilities");
const firebaseAdmin = require('../utils/firebase');
const moment = require("moment");

var deviceKeys = ["deviceId", "deviceName", "parentId", "childId", "versionCode", "listSize", "apps", "model", "fcmToken", "manufacturer", "model"]




//  scan Qr Code  //
const scanQrCode = async (res, bodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!bodyData.parentId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.PARENT_ID_REQUIRED);
            }
            return response.failure(res, 400, message.PARENT_ID_REQUIRED);
        }
        if (!bodyData.childId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.CHILD_ID_REQUIRED);
            }
            return response.failure(res, 400, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.deviceId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.REQUIRE_CHILD_DEVICE_ID);
            }
            return response.failure(res, 400, message.REQUIRE_CHILD_DEVICE_ID);
        }
        if (!bodyData.FcmToken) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.REQUIRE_FCM);
            }
            return response.failure(res, 400, message.REQUIRE_FCM);
        }

        let isParentExists = await childService.getParentDataById(bodyData.parentId);
        if (!isParentExists) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_PARENT_ID);
            }
            return response.failure(res, 400, message.INVALID_PARENT_ID);
        }

        let isChildExists = await childService.getChildDataById(bodyData.childId);
        if (!isChildExists) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_CHILD_ID);
            }
            return response.failure(res, 400, message.INVALID_CHILD_ID);
        }

        //  check if device is already connected to other child  //
        let deviceData = await childService.isDeviceExists(bodyData.deviceId)
        console.log('@@@@@@@@@@@@@  deviceData.childId : ', deviceData.childId, '  @@@@@@@@@@  bodyData.childId : ', bodyData.childId);
        if (deviceData && (deviceData.childId != '') && (deviceData.childId != bodyData.childId)) {
            console.log('#################');
            let updatedChildData = {
                deviceId: '',
                fcmToken: ''
            }
            let updateOldChildData = await childService.updateChildDataById(deviceData.childId, updatedChildData);

            let updatedData = {
                scheduledBy: '',
                eachDaySchedule: [],
                everyDaySchedule: '',
                timeSpent: '',
                remainingTime: ''
            }
            let updateDeviceDataById = await childService.updateDeviceDataById(deviceData.firestoreDevicePathId, updatedData);
            let updateDeviceAppsData = await childService.updateDeviceAppsData(bodyData.deviceId, updatedData)
        }

        //  check is child already connected to other device or not  //
        if ((isChildExists.deviceId != "") && (isChildExists.deviceId != bodyData.deviceId)) {
            console.log('85 ***************');
            //  send device disconnect notification to child  //
            let connectedDeviceData = await childService.isDeviceExists(isChildExists.deviceId);
            let oldFcmToken = connectedDeviceData.fcmToken
            console.log('68  ======= oldFcmToken : ', oldFcmToken);
            let deviceDisconnectNotification = await notificationData.deviceDisconnectNotification(isChildExists, isParentExists, oldFcmToken);

            //  update child data  //
            let updatedChildData = {
                deviceId: "",
                fcmToken: ""
            }
            let updateChildDataById = await childService.updateChildDataById(bodyData.childId, updatedChildData);

            //  unlink connected device  //
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

        //  generate child auth token  //
        const authToken = await KenanUtilities.generateChildToken(bodyData.childId, bodyData.deviceId);
        let newChildData = {
            parentId: bodyData.parentId,
            deviceId: bodyData.deviceId,
            fcmToken: bodyData.FcmToken,
            // password: hashedPassword,
            authToken: authToken
        }
        let updateNewChildDataById = await childService.updateChildDataById(bodyData.childId, newChildData);

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

        if (headers.lang == 'ar') {
            return response.data(res, finaldata, 200, arabicMessage.SUCCESS)
        } else {
            return response.data(res, finaldata, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  add Child  // 
const addDeviceApps = async (res, reqBodyData, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!reqBodyData.deviceId) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.REQUIRE_CHILD_DEVICE_ID);
            }
            return response.failure(res, 400, message.REQUIRE_CHILD_DEVICE_ID);
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
                console.log("200 >>>>>>>>> element.status : ", element.status);
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
                        status: 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        timeSpent: element.timeSpent || '00',
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
                        status: isDeviceAppExists.status ? isDeviceAppExists.status : 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        timeSpent: isDeviceAppExists.timeSpent ? isDeviceAppExists.timeSpent : element.timeSpent ? element.timeSpent : '00',
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
                fcmToken: bodyData.fcmToken || isDeviceExists.fcmToken,
            }
            let updateDeviceDataById = await childService.updateDeviceDataById(firestoreDevicePathId, newData);

            //  Insert new Apps  //
            let appArr = reqBodyData.apps;
            appArr.forEach(async (element) => {
                console.log("273 >>>>>>>>>. element.status : ", element.status);
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
                        status: 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        timeSpent: element.timeSpent || '00',
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
                        status: isDeviceAppExists.status ? isDeviceAppExists.status : 0,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        timeSpent: isDeviceAppExists.timeSpent ? isDeviceAppExists.timeSpent : element.timeSpent ? element.timeSpent : '00',
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

        if (headers.lang == 'ar') {
            return response.data(res, data, 200, arabicMessage.SUCCESS)
        } else {
            return response.data(res, data, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  get child details  //
const childDetails = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        const childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        }

        let childDeviceData = await childService.isDeviceExists(childData.deviceId);
        childData.scheduledBy = childDeviceData.scheduledBy || '';
        childData.eachDaySchedule = childDeviceData.eachDaySchedule || [];
        childData.everyDaySchedule = childDeviceData.everyDaySchedule || '';
        childData.timeSpent = childDeviceData.timeSpent || '0';

        if (headers.lang == 'ar') {
            return response.data(res, childData, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, childData, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child Device App List for child  //
const deviceAppListByChild = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }

        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        }

        let childDeviceAppList = await childService.childDeviceAppList(childData.deviceId);

        if (headers.lang == 'ar') {
            return response.data(res, childDeviceAppList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, childDeviceAppList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  update child device and app usage  //
const updateUsageTime = async (res, headers, bodyData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };
        if (!bodyData.packageName) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.REQUIRE_PACKAGE_NAME);
            }
            return response.failure(res, 400, message.REQUIRE_PACKAGE_NAME);
        };
        if (!bodyData.startTime) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.START_TIME_REQUIRED);
            }
            return response.failure(res, 400, message.START_TIME_REQUIRED);
        };
        if (!bodyData.endTime) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.END_TIME_REQUIRED);
            }
            return response.failure(res, 400, message.END_TIME_REQUIRED);
        };
        if (!bodyData.type) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TYPE_IS_REQUIRED);
            }
            return response.failure(res, 400, message.TYPE_IS_REQUIRED)
        };

        const parentData = await childService.getParentDataById(childData.parentId);
        const childAppDetails = await childService.childAppDetailsByPackageName(childData.deviceId, bodyData.packageName);
        const deviceDetails = await childService.getDeviceDataByFirestoreId(childAppDetails.firestoreDeviceId);
        const pointSettings = 5;

        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
        const day = new Date().getDay();
        let totalAppTimeSpent = childAppDetails.timeSpent || '0';
        console.log('489  === childAppDetails.timeSpent : ', childAppDetails.timeSpent, ' === startTime : ', bodyData.startTime, ' === endTime : ', bodyData.endTime);
        let usageStartTime = new Date(parseInt(bodyData.startTime));
        let usageEndTime = new Date(parseInt(bodyData.endTime));

        let minuteDiff = usageEndTime.getMinutes() - usageStartTime.getMinutes();
        let hourDiff = usageEndTime.getHours() - usageStartTime.getHours();
        let timeSpent = Math.round((hourDiff * 60) + minuteDiff);
        console.log('496  ==== minuteDiff : ', minuteDiff, ' === hourDiff : ', hourDiff, ' === timeSpent : ', timeSpent);

        // let timeSpent = usageEndTime.getMinutes() - usageStartTime.getMinutes();
        console.log('499 ==== usageStartTime : ', usageStartTime, ' ==== usageEndTime : ', usageEndTime);

        let appRemainingTime = '0';
        let deviceRemainingTime = '0';
        let totalTimeSpent = deviceDetails.timeSpent || '0';

        //  update both app and device usage time  //
        //  if only app usage is restricted by parent  //
        if ((childAppDetails.scheduledBy != '') && (deviceDetails.scheduledBy == '')) {
            console.log("405 >>>>  totalAppTimeSpent : ", totalAppTimeSpent, "  >>>> timeSpent : ", timeSpent);

            if (childAppDetails.scheduledBy == 'eachDay') {
                let dateDetails = await childAppDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
                    appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
                }
            }

            if (childAppDetails.scheduledBy == 'everyDay') {
                let scheduledTime = childAppDetails.everyDaySchedule;
                totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
                appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
            }

            let newAppData = {
                timeSpent: `${totalAppTimeSpent}`,
                remainingTime: `${appRemainingTime}`
            }
            console.log("426 >>>>>  newAppData :", newAppData);
            let updateChildAppDetails = await childService.updateDeviceAppDataById(childAppDetails.firestoreDeviceAppId, newAppData);

            totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent);
            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log("434 >>>>>>  newDeviceData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);

            //  send notification to parent about usage time  //
            //  when app time limit reached  //
            if (parseInt(newAppData.remainingTime) == 0) {
                let appRemainingTimeReachedNotification = await notificationData.appRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("441 >>>>>  appRemainingTimeReachedNotification : ");
            }
            //  when app time limit crossed  //
            if (parseInt(newAppData.remainingTime) < 0) {
                let appRemainingTimeCrossedNotification = await notificationData.appRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("446 >>>>  appRemainingTimeCrossedNotification : ");

                //  decrease point from child profile  //
                if (parseInt(timeSpent) > pointSettings) {
                    let decreasePointAmount = parseInt(timeSpent) / pointSettings;
                    console.log("+++++++++  decreasePointAmount : ", decreasePointAmount);
                    let totalPoint = parseInt(childData.points) - parseInt(decreasePointAmount);
                    let updatedData = { points: totalPoint }
                    let updateChildDataById = await childService.updateChildDataById(decoded.childId, updatedData)
                }
            }

            let resultData = {
                status: childAppDetails.status,
                timeSpent: `${totalAppTimeSpent}`,
                scheduledBy: childAppDetails.scheduledBy || '',
                everyDaySchedule: childAppDetails.everyDaySchedule || '',
                eachDaySchedule: childAppDetails.eachDaySchedule || [],
                packageName: bodyData.packageName,
            }

            if (headers.lang == 'ar') {
                return response.data(res, resultData, 200, arabicMessage.SUCCESS)
            } else {
                return response.data(res, resultData, 200, message.SUCCESS)
            }
        }

        //  if only device usage is restricted by parent  //
        if ((childAppDetails.scheduledBy == '') && (deviceDetails.scheduledBy != '')) {
            console.log("461 ====  totalAppTimeSpent : ", totalAppTimeSpent, "  ==== timeSpent : ", timeSpent);

            if (deviceDetails.scheduledBy == 'eachDay') {
                let dateDetails = await deviceDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent)
                    deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
                }
            }

            if (deviceDetails.scheduledBy == 'everyDay') {
                let scheduledTime = deviceDetails.everyDaySchedule;
                totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent);
                deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
            }

            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log("482 ====  newDeviceData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);

            totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
            let newAppData = {
                timeSpent: `${totalAppTimeSpent}`,
                remainingTime: `${appRemainingTime}`
            }
            console.log("490 ====  newAppData :", newAppData);
            let updateChildAppDetails = await childService.updateDeviceAppDataById(childAppDetails.firestoreDeviceAppId, newAppData);

            //  send notification to parent about usage time  //
            //  when device time limit reached  //
            if (parseInt(newDeviceData.remainingTime) == 0) {
                let deviceRemainingTimeReachedNotification = await notificationData.deviceRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("497 ====  deviceRemainingTimeReachedNotification : ");
            }

            //  when only device time limit crossed  //
            if (parseInt(newDeviceData.remainingTime) < 0) {
                let deviceRemainingTimeCrossedNotification = await notificationData.deviceRemainingTimeCrossedNotification(childData, parentData);
                console.log("503 ====  deviceRemainingTimeCrossedNotification : ");

                //  decrease point from child profile  //
                if (parseInt(timeSpent) > pointSettings) {
                    let decreasePointAmount = parseInt(timeSpent) / pointSettings;
                    console.log("+++++++++  decreasePointAmount : ", decreasePointAmount);
                    let totalPoint = parseInt(childData.points) - parseInt(decreasePointAmount);
                    let updatedData = { points: totalPoint }
                    let updateChildDataById = await childService.updateChildDataById(decoded.childId, updatedData)
                }
            }

            let resultData = {
                status: childAppDetails.status,
                timeSpent: `${totalAppTimeSpent}`,
                scheduledBy: childAppDetails.scheduledBy || '',
                everyDaySchedule: childAppDetails.everyDaySchedule || '',
                eachDaySchedule: childAppDetails.eachDaySchedule || [],
                packageName: bodyData.packageName,
            }

            if (headers.lang == 'ar') {
                return response.data(res, resultData, 200, arabicMessage.SUCCESS)
            } else {
                return response.data(res, resultData, 200, message.SUCCESS)
            }
        }

        //  if both device usage and app usage is restricted by parent  //
        if ((childAppDetails.scheduledBy != '') && (deviceDetails.scheduledBy != '')) {
            console.log("519 <<<<  totalAppTimeSpent : ", totalAppTimeSpent, "  <<<< timeSpent : ", timeSpent);

            if (childAppDetails.scheduledBy == 'eachDay') {
                let dateDetails = await childAppDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
                    appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
                }
            }

            if (childAppDetails.scheduledBy == 'everyDay') {
                let scheduledTime = childAppDetails.everyDaySchedule;
                totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
                appRemainingTime = parseInt(scheduledTime) - parseInt(totalAppTimeSpent);
            }

            let newAppData = {
                timeSpent: `${totalAppTimeSpent}`,
                remainingTime: `${appRemainingTime}`
            }
            console.log("540 <<<<  newAppData :", newAppData);
            let updateChildAppDetails = await childService.updateDeviceAppDataById(childAppDetails.firestoreDeviceAppId, newAppData);

            if (deviceDetails.scheduledBy == 'eachDay') {
                let dateDetails = await deviceDetails.eachDaySchedule.filter(element => { return (element.day == dayName) });
                if (dateDetails.length > 0) {
                    let scheduledTime = dateDetails[0].time;
                    totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent)
                    deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
                }
            }

            if (deviceDetails.scheduledBy == 'everyDay') {
                let scheduledTime = deviceDetails.everyDaySchedule;
                totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent);
                deviceRemainingTime = parseInt(scheduledTime) - parseInt(totalTimeSpent);
            }

            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log("563 <<<<  newDeviceData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);

            //  send notification to parent about usage time  //
            //  when app time limit reached  //
            if ((parseInt(newAppData.remainingTime) == 0) && (parseInt(newDeviceData.remainingTime > 0))) {
                let appRemainingTimeReachedNotification = await notificationData.appRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("569 <<<<  appRemainingTimeReachedNotification : ");
            }

            //  when only app time limit crossed  //
            if ((parseInt(newAppData.remainingTime) < 0) && (parseInt(newDeviceData.remainingTime) >= 0)) {
                let appRemainingTimeCrossedNotification = await notificationData.appRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("574 <<<<  appRemainingTimeCrossedNotification : ");

                //  decrease point from child profile  //
                if (parseInt(timeSpent) > pointSettings) {
                    let decreasePointAmount = parseInt(timeSpent) / pointSettings;
                    console.log("579 <<<<  decreasePointAmount : ", decreasePointAmount);
                    let totalPoint = parseInt(childData.points) - parseInt(decreasePointAmount);
                    let updatedData = { points: totalPoint }
                    let updateChildDataById = await childService.updateChildDataById(decoded.childId, updatedData)
                }
            }

            //  when device time limit reached  //
            if ((parseInt(newDeviceData.remainingTime) == 0) && (parseInt(newAppData.remainingTime) > 0)) {
                let deviceRemainingTimeReachedNotification = await notificationData.deviceRemainingTimeReachedNotification(childData, childAppDetails, parentData);
                console.log("590 <<<<  deviceRemainingTimeReachedNotification : ");
            }

            //  when only device time limit crossed  //
            if ((parseInt(newDeviceData.remainingTime) < 0) && (parseInt(newAppData.remainingTime) >= 0)) {
                let deviceRemainingTimeCrossedNotification = await notificationData.deviceRemainingTimeCrossedNotification(childData, parentData);
                console.log("596 <<<<  deviceRemainingTimeCrossedNotification : ");

                //  decrease point from child profile  //
                if (parseInt(timeSpent) > pointSettings) {
                    let decreasePointAmount = parseInt(timeSpent) / pointSettings;
                    console.log("601 <<<<  decreasePointAmount : ", decreasePointAmount);
                    let totalPoint = parseInt(childData.points) - parseInt(decreasePointAmount);
                    let updatedData = { points: totalPoint }
                    let updateChildDataById = await childService.updateChildDataById(decoded.childId, updatedData)
                }
            }

            //  when both time limit crossed  //
            if ((parseInt(newAppData.remainingTime) < 0) && (parseInt(newDeviceData.remainingTime) < 0)) {
                let bothRemainingTimeCrossedNotification = await notificationData.bothRemainingTimeCrossedNotification(childData, childAppDetails, parentData);
                console.log("611 <<<<  bothRemainingTimeCrossedNotification : ");

                //  decrease point from child profile  //
                if (parseInt(timeSpent) > pointSettings) {
                    let decreasePointAmount = parseInt(timeSpent) / pointSettings;
                    console.log("616 <<<<  decreasePointAmount : ", decreasePointAmount);
                    let totalPoint = parseInt(childData.points) - parseInt(decreasePointAmount);
                    let updatedData = { points: totalPoint }
                    let updateChildDataById = await childService.updateChildDataById(decoded.childId, updatedData)
                }
            }

            let resultData = {
                status: childAppDetails.status,
                timeSpent: `${totalAppTimeSpent}`,
                scheduledBy: childAppDetails.scheduledBy || '',
                everyDaySchedule: childAppDetails.everyDaySchedule || '',
                eachDaySchedule: childAppDetails.eachDaySchedule || [],
                packageName: bodyData.packageName,
            }

            if (headers.lang == 'ar') {
                return response.data(res, resultData, 200, arabicMessage.SUCCESS)
            } else {
                return response.data(res, resultData, 200, message.SUCCESS)
            }
        }

        //  if nothing was restricted by parent  //
        if ((childAppDetails.scheduledBy == '') && (deviceDetails.scheduledBy == '')) {
            console.log("624 ++++  totalAppTimeSpent : ", totalAppTimeSpent, "  ++++ timeSpent : ", timeSpent, '  ++++ totalTimeSpent : ', totalTimeSpent);

            totalAppTimeSpent = parseInt(totalAppTimeSpent) + parseInt(timeSpent);
            let newAppData = {
                timeSpent: `${totalAppTimeSpent}`,
                remainingTime: `${appRemainingTime}`
            }
            console.log("631 ++++  newAppData :", newAppData);
            let updateChildAppDetails = await childService.updateDeviceAppDataById(childAppDetails.firestoreDeviceAppId, newAppData);

            totalTimeSpent = parseInt(totalTimeSpent) + parseInt(timeSpent);
            let newDeviceData = {
                timeSpent: `${totalTimeSpent}`,
                remainingTime: `${deviceRemainingTime}`
            }
            console.log("639 ++++  newDeviceData :", newDeviceData);
            let updateChildDeviceDetails = await childService.updateDeviceDataById(deviceDetails.firestoreDevicePathId, newDeviceData);

            let resultData = {
                status: childAppDetails.status,
                timeSpent: `${totalAppTimeSpent}`,
                scheduledBy: childAppDetails.scheduledBy || '',
                everyDaySchedule: childAppDetails.everyDaySchedule || '',
                eachDaySchedule: childAppDetails.eachDaySchedule || [],
                packageName: bodyData.packageName,
            }

            if (headers.lang == 'ar') {
                return response.data(res, resultData, 200, arabicMessage.SUCCESS)
            } else {
                return response.data(res, resultData, 200, message.SUCCESS)
            }
        }

        // return response.success(res, 200, message.SUCCESS)
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  child Notification List //
const childNotificationList = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };

        let notificationList = await childService.notificationList(childData.childId);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS)
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS)
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  notification Delete By Id  //
const notificationDeleteById = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };
        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.NOTIFICATION_ID_REQUIRED);
            }
            return response.failure(res, 400, message.NOTIFICATION_ID_REQUIRED);
        }

        let notificationDeleteById = await childService.notificationDeleteById(paramData.id);
        let notificationList = await childService.notificationList(childData.childId);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  all Child Notification Delete  //
const allChildNotificationDelete = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };

        //create DB batch to update multiple data
        let deleteAllNotification = await childService.allChildNotificationDelete(childData.childId);
        let notificationList = await childService.notificationList(childData.childId);

        if (headers.lang == 'ar') {
            return response.data(res, notificationList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, notificationList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  gift List  //
const giftList = async (res, headers) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };

        const giftList = await childService.giftList(decoded.childId);

        if (headers.lang == 'ar') {
            return response.data(res, giftList, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, giftList, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  redeem Gift  //
const redeemGift = async (res, headers, paramData) => {
    try {
        if (!headers.lang) {
            return response.failure(res, 400, message.LANGUAGE_REQUIRED);
        }

        if (!paramData.id) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.GIFT_ID_REQUIRED);
            }
            return response.failure(res, 400, message.GIFT_ID_REQUIRED);
        }
        if (!headers.authorization) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.TOKEN_REQUIRED);
            }
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.INVALID_TOKEN);
            }
            return response.failure(res, 400, message.INVALID_TOKEN);
        };

        let parentData = await childService.getParentDataById(childData.parentId);
        if (!parentData) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.SOMETHING_WRONG);
            }
            return response.failure(res, 400, message.SOMETHING_WRONG);
        }

        let giftDetails = await childService.giftDetailsById(paramData.id);
        if (!giftDetails) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.GIFT_ID_INVALID);
            }
            return response.failure(res, 400, message.GIFT_ID_INVALID);
        }

        console.log(">>>>> childData.points : ", childData.points, "  >>>>> giftDetails.points : ", giftDetails.points);
        //  check if child has enough point ti redeem selected gift  //
        if (parseInt(childData.points) < parseInt(giftDetails.points)) {
            if (headers.lang == 'ar') {
                return response.failure(res, 400, arabicMessage.NOT_ENOUGH_POINTs);
            }
            return response.failure(res, 400, message.NOT_ENOUGH_POINTs);
        }

        //  send notification to parent of redeem gift request  //
        let requestRedeemGiftNotification = await notificationData.requestRedeemGiftNotification(childData, parentData, headers.lang, giftDetails);
        console.log("441 >>>>>  requestRedeemGiftNotification : ");

        let finalPoints = parseInt(childData.points) - parseInt(giftDetails.points);
        let updatedChildData = { points: finalPoints };
        let updateChildDataById = await childService.updateChildDataById(childData.childId, updatedChildData)

        if (headers.lang == 'ar') {
            return response.data(res, updatedChildData, 200, arabicMessage.SUCCESS);
        } else {
            return response.data(res, updatedChildData, 200, message.SUCCESS);
        }
    } catch (error) {
        return response.failure(res, 400, error);
    }
}

//  refresh FcmToken  //
const refreshFcmToken = async (res, bodyData, headers) => {
    try {
        if (!bodyData.fcmToken) {
            return response.failure(res, 400, message.REQUIRE_FCM);
        }
        if (!headers.authorization) {
            return response.failure(res, 400, message.TOKEN_REQUIRED);
        }
        const decoded = await KenanUtilities.decryptToken(headers.authorization);
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            return response.failure(res, 400, message.INVALID_TOKEN);
        };

        let updatedData = { fcmToken: bodyData.fcmToken }
        let updateChildData = await childService.updateChildDataById(childData.childId, updatedData);

        let childDeviceData = await childService.isDeviceExists(childData.deviceId)
        let updateChildDeviceData = await childService.updateDeviceDataById(childDeviceData.firestoreDevicePathId, updatedData)

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
    childNotificationList,
    notificationDeleteById,
    allChildNotificationDelete,
    giftList,
    redeemGift,
    refreshFcmToken,
}