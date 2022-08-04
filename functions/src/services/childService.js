const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });




//  isDeviceExists  //
const isDeviceExists = async (deviceId) => {
    try {
        let deviceData =  await db.collection("devices").where("deviceId", "==", deviceId).limit(1).get();
        console.log("************ deviceData : ",deviceData);
        return deviceData;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    isDeviceExists,
}