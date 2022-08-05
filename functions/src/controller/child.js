const childService = require("../services/childService");
const response = require("../utils/response");
const message = require("../utils/message");
const notificationData = require("../services/notification");
const differenceBy = require("lodash/differenceBy");
const KenanUtilities = require("../utils/KenanUtilities");

var deviceKeys = ["deviceId", "deviceName", "parentId", "childId", "versionCode", "listSize", "apps", "model", "fcmToken", "manufacturer", "model"]



//  add Child  //
const addDeviceApps = async (res, reqBodyData) => {
    try {
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
                        phoneTimeLimit: element.phoneTimeLimit || 1800,
                        dailyTimeLimit: element.individualAppTimeLimit || 0,
                        spendTime: element.timeSpent || 0,
                        usageTimeOnDays: element.usageTimeOnDays || '',
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
                        phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        spendTime: isDeviceAppExists.spendTime ? isDeviceAppExists.spendTime : element.timeSpent,
                        usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
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
                        phoneTimeLimit: element.phoneTimeLimit || 1800,
                        dailyTimeLimit: element.individualAppTimeLimit || 0,
                        spendTime: element.timeSpent || 0,
                        usageTimeOnDays: element.usageTimeOnDays || '',
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
                        phoneTimeLimit: isDeviceAppExists.phoneTimeLimit ? isDeviceAppExists.phoneTimeLimit : element.phoneTimeLimit,
                        dailyTimeLimit: isDeviceAppExists.dailyTimeLimit ? isDeviceAppExists.dailyTimeLimit : element.individualAppTimeLimit,
                        spendTime: isDeviceAppExists.spendTime ? isDeviceAppExists.spendTime : element.timeSpent,
                        usageTimeOnDays: isDeviceAppExists.usageTimeOnDays ? isDeviceAppExists.usageTimeOnDays : element.usageTimeOnDays,
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





module.exports = {
    addDeviceApps,
}