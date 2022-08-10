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
        console.log(">>>>>>>>>> bodyData : ", bodyData);
        if (!bodyData.parentId) {
            return response.failure(res, 200, message.PARENT_ID_REQUIRED);
        }
        if (!bodyData.childId) {
            return response.failure(res, 200, message.CHILD_ID_REQUIRED);
        }
        if (!bodyData.deviceId) {
            return response.failure(res, 200, message.REQUIRE_CHILD_DEVICE_ID);
        }
        if (!bodyData.password) {
            return response.failure(res, 200, message.PASSWORD_REQUIRED);
        }
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
                versionCode: ""
            }
            let addDeviceData = await childService.addDeviceData(newData);
        }
        else {
            console.log("===========  if device exists ");
            let newdDeviceData = {
                childId: bodyData.childId,
                parentId: bodyData.parentId,
                fcmToken: bodyData.FcmToken
            }
            let updateNewDeviceDataById = await childService.updateDeviceDataById(isDeviceExists.firestoreDevicePathId, newdDeviceData);
        }

        let hashedPassword = await KenanUtilities.cryptPassword(bodyData.password);
        //  generate child auth token  //
        const authToken = await KenanUtilities.generateChildToken(bodyData.childId, bodyData.deviceId);

        let newChildData = {
            deviceId: bodyData.deviceId,
            fcmToken: bodyData.FcmToken,
            password: hashedPassword,
            authToken: authToken
        }
        let updateNewChildDataById = await childService.updateChildDataById(bodyData.childId, newChildData);


        //  subscribe child topic with parent  // 
        const registrationTokens = [isParentExists.fcmToken];
        let topic = `child_${bodyData.childId}`;
        let topicMsg = await firebaseAdmin.firebaseSubscribeTopicNotification(registrationTokens, topic);

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
            let reqData = bodyData;
            delete bodyData.apps;
            let addDeviceData = await childService.addDeviceData(reqData);
            let getDeviceDataByFirestoreId = await childService.getDeviceDataByFirestoreId(addDeviceData)
            firestoreDevicePathId = getDeviceDataByFirestoreId._ref._path.segments[1];

            //  Insert data in Apps  //
            let appArr = reqBodyData.apps;
            appArr.forEach(async (element) => {
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
                        status: element.status || 2,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        // phoneTimeLimit: element.phoneTimeLimit || 1800,
                        // dailyTimeLimit: element.individualAppTimeLimit || 0,
                        spendTime: element.timeSpent || 0,
                        usageTimeOnDays: element.usageTimeOnDays || '',
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
                        status: element.status ? element.status : isDeviceAppExists.status ? isDeviceAppExists.status : 2,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        // phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        // dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        spendTime: isDeviceAppExists.spendTime ? isDeviceAppExists.spendTime : element.timeSpent,
                        usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
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
                        status: element.status || 2,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: element.noOfLaunches || 0,
                        // phoneTimeLimit: element.phoneTimeLimit || 1800,
                        // dailyTimeLimit: element.individualAppTimeLimit || 0,
                        spendTime: element.timeSpent || 0,
                        usageTimeOnDays: element.usageTimeOnDays || '',
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
                        status: element.status ? element.status : isDeviceAppExists.status ? isDeviceAppExists.status : 2,
                        firestoreDeviceId: firestoreDevicePathId,
                        noOfLaunches: isDeviceAppExists.noOfLaunches ? isDeviceAppExists.noOfLaunches : element.noOfLaunches,
                        // phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        // dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        spendTime: isDeviceAppExists.spendTime ? isDeviceAppExists.spendTime : element.timeSpent,
                        usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
                        scheduledBy: isDeviceAppExists.scheduledBy ? isDeviceAppExists.scheduledBy : element.scheduledBy,
                        eachDaySchedule: isDeviceAppExists.eachDaySchedule ? isDeviceAppExists.eachDaySchedule : element.eachDaySchedule,
                        everyDaySchedule: isDeviceAppExists.everyDaySchedule ? isDeviceAppExists.everyDaySchedule : element.everyDaySchedule,
                    }
                    let updateDeviceAppDataById = await childService.updateDeviceAppDataById(isDeviceAppExists.firestoreDeviceAppId, updatedDeviceAppData);
                }
            })
        }

        return res.send({ responseCode: 200, status: true, message: message.SUCCESS, data: { deviceId: firestoreDevicePathId } });
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
        let childData = await childService.getChildDataById(decoded.childId);
        if (!childData) {
            return response.failure(res, 200, message.INVALID_TOKEN);
        }

        return response.data(res,childData, 400, message.SUCCESS);
    } catch (error) {
        return response.failure(res, 400, error);
    }
}






module.exports = {
    addDeviceApps,
    scanQrCode,
    childDetails,
}