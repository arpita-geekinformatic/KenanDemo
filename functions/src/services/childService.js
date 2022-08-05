const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });




//  isDeviceExists  //
const isDeviceExists = async (deviceId) => {
    try {
        let deviceData = await db.collection("devices").where("deviceId", "==", deviceId).limit(1).get();

        if (deviceData.empty) {
            return false
        }

        let deviceArr = [];
        let firestoreDevicePathId;
        deviceData.forEach(doc => {
            deviceArr.push(doc.data());
            deviceArr[0].firestoreDevicePathId = doc.id;
        })
        return deviceArr[0];

    } catch (error) {
        throw error;
    }
}

//  add Device Data  //
const addDeviceData = async (newData) => {
    try {
        let addDevice = await db.collection("devices").add(newData);
        return addDevice.id;
    } catch (error) {
        throw error;
    }
}

//  get Device Data By Firestore device Id  //
const getDeviceDataByFirestoreId = async (firestoreDeviceId) => {
    try {
        let deviceData = db.collection("devices").doc(firestoreDeviceId).get();
        return deviceData;

    } catch (error) {
        throw error;
    }
}

//  get App By Name and packageName  //
const getAppByName = async (appName, packageName) => {
    try {
        let appData = await db.collection("apps").where("appName", "==", appName).where("packageName", "==", packageName).limit(1).get();

        if (appData.empty) {
            return false
        }

        let firestoreAppId;
        appData.forEach(async (doc) => {
            firestoreAppId = doc.id;
        })
        return firestoreAppId;

    } catch (error) {
        throw error;
    }
}

//  add New App  //
const addNewApp = async (newAppData) => {
    try {
        let newApp = await db.collection("apps").add(newAppData);
        return newApp.id;
    } catch (error) {
        throw error;
    }
}

//  update App Data  //
const updateAppData = async (firestoreAppId, updatedData) => {
    try {
        let updateAppData = await db.collection("apps").doc(firestoreAppId).update(updatedData);
        return true

    } catch (error) {
        throw error;
    }
}

//  is Device App Exists  //
const isDeviceAppExists = async (firestoreDevicePathId, firestoreAppId) => {
    try {
        let isDeviceAppExists = await db.collection("deviceApps").where("firestoreDeviceId", "==", firestoreDevicePathId).where("firestoreAppId", "==", firestoreAppId).get();

        if (isDeviceAppExists.empty) {
            return false
        }

        let deviceAppArr = [];
        let firestoreDeviceAppId;
        isDeviceAppExists.forEach(doc => {
            deviceAppArr.push(doc.data());
            deviceAppArr[0].firestoreDeviceAppId = doc.id
        })

        return deviceAppArr[0]
    } catch (error) {
        throw error;
    }
}

//  add Device App Data  //
const addDeviceAppData = async (newDeviceAppData) => {
    try {
        let addDeviceAppData = await db.collection("deviceApps").add(newDeviceAppData);
        return true;

    } catch (error) {
        throw error;
    }
}

//  update DeviceApp Data byId  //
const updateDeviceAppDataById = async (firestoreDeviceAppId, updatedDeviceAppData) => {
    try {
        let updateDeviceAppDataById = await db.collection("deviceApps").doc(firestoreDeviceAppId).update(updatedDeviceAppData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  update Device Data By Id  //
const updateDeviceDataById = async (firestoreDevicePathId, updatedData) => {
    try {
        let updateDeviceDataById = await db.collection("devices").doc(firestoreDevicePathId).update(updatedData);
        return true;

    } catch (error) {
        throw error;
    }
}




module.exports = {
    isDeviceExists,
    addDeviceData,
    getDeviceDataByFirestoreId,
    getAppByName,
    addNewApp,
    updateAppData,
    isDeviceAppExists,
    addDeviceAppData,
    updateDeviceAppDataById,
    updateDeviceDataById,
}