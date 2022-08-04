const childService = require("../services/childService");
const response = require("../utils/response");
const message = require("../utils/message");
const notificationData = require("../services/notification");
const differenceBy = require("lodash/differenceBy");
const KenanUtilities = require("../utils/KenanUtilities");

var deviceKeys = ["deviceId", "deviceName", "parentId", "childId", "versionCode", "listSize", "apps", "model", "fcmToken", "manufacturer", "model"]



//  add Child  //
const addDeviceApps = async (res, reqData) => {
    try {
        console.log("======= call 1");
        let bodyData = KenanUtilities.mapToValues(deviceKeys, reqData);

        let isDeviceExists = await childService.isDeviceExists(bodyData.deviceId);
        
       
        let firestoreDevicePathId;


        // if (!headers.authorization) {
        //     return response.failure(res, 200, message.TOKEN_REQUIRED);
        // }
        // if (!bodyData.name) {
        //     return response.failure(res, 200, message.KID_NAME_REQUIRED);
        // }

        // const decoded = await KenanUtilities.decryptToken(headers.authorization);
        // let parentRes = await parentService.findParentByToken(headers.authorization);
        // if (!parentRes) {
        //     return response.failure(res, 200, message.INVALID_TOKEN);
        // }

        // let childData = await childService.getChildByParent(bodyData.name, parentRes.firestore_parentId);

        // if(!childData){
        //    const newData = {
        //         name : bodyData.name,
        //         age : bodyData.age || 0,
        //         email : bodyData.email || "",
        //         gender : bodyData.gender || "",
        //         photo : "",
        //         parentId : parentRes.firestore_parentId,
        //         deviceId : bodyData.deviceId || "",
        //         isDeleted: false,
        //         fcmToken: bodyData.fcmToken || "",
        //     }

        //     let addChildByParent = await childService.addChildByParent(newData);
        //     newData.childId = addChildByParent;
        //     return res.send({ responseCode: 200, status: true, message: message.KID_ADDED, data: newData });
        // }

        // return res.send({ responseCode: 200, status: true, message: message.KID_EXISTS, data: {} });
    } catch (error) {
        return response.failure(res, 400, error);
    }
}





module.exports = {
    addDeviceApps,
}