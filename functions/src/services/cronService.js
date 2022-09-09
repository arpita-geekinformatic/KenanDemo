const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



// >>>>>>>>>>>>>>  CHILDS  >>>>>>>>>>>>//
//  get Child Data By Id  //
const getChildDataById = async (childId) => {
    try {
        let childDetails = await db.collection("childs").doc(childId).get();
        if (!childDetails._fieldsProto) {
            return false;
        }
        if (childDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let childData = {
            childId: childId,
            age: childDetails._fieldsProto.age.integerValue,
            deviceId: childDetails._fieldsProto.deviceId.stringValue,
            email: childDetails._fieldsProto.email.stringValue,
            fcmToken: childDetails._fieldsProto.fcmToken.stringValue,
            gender: childDetails._fieldsProto.gender.stringValue,
            name: childDetails._fieldsProto.name.stringValue,
            parentId: childDetails._fieldsProto.parentId.stringValue,
            photo: childDetails._fieldsProto.photo ? childDetails._fieldsProto.photo.stringValue : '',
            authToken: childDetails._fieldsProto.authToken ? childDetails._fieldsProto.authToken.stringValue : '',
            points: childDetails._fieldsProto.points ? childDetails._fieldsProto.points.integerValue : 0,
            badge: childDetails._fieldsProto.badge ? childDetails._fieldsProto.badge.integerValue : 0,
        }
        return childData;

    } catch (error) {
        throw error;
    }
}

//  update Child Data By Id  //
const updateChildDataById = async (childId, updatedData) => {
    try {
        let updateChild = await db.collection("childs").doc(childId).update(updatedData);
        return true;
    } catch (error) {
        throw error;
    }
}


//  >>>>>>>>>>>>   DEVICES   >>>>>>>>>>  //
//  get All Connected Device Data  //
const getAllConnectedDeviceData = async () => {
    try {
        const deviceData = await db.collection('devices').where('childId', '!=', '').get();

        let deviceArr = [];
        deviceData.forEach(doc => {
            let deviceDetails = doc.data();
            deviceDetails.firestoreDeviceId = doc.id;
            deviceArr.push(deviceDetails);
        });

        return deviceArr;
    } catch (error) {
        throw error;
    }
}

//  update All Device Time Spent  //
const updateAllDeviceTimeSpent = async () => {
    try {
        const batch = db.batch();
        const snapshot = await db.collection('devices').get()

        snapshot.forEach((element) => {
            batch.update(element.ref, {
                timeSpent: '0',
                remainingTime: '0'
            });
        });
        await batch.commit();
        return true;

    } catch (error) {
        throw error;
    }
}


//  update Device Time Spent By Id  //
const updateDeviceTimeSpentById = async (firestoreDeviceId) => {
    try {
        let newData = {
            timeSpent: '0',
            remainingTime: '0'
        }
        let updateAdmin = await db.collection('devices').doc(firestoreDeviceId).update(newData);
        return true;
    } catch (error) {
        throw error;
    }

}




//  >>>>>>>>>>>>   DEVICE APPS   >>>>>>>>>>  //
//  get Connected Device App Data  //
const getConnectedDeviceAppData = async (deviceId) => {
    try {
        const deviceAppData = await db.collection('deviceApps').where('deviceId', '==', deviceId).get();

        let deviceAppArr = [];
        deviceAppData.forEach(doc => {
            let deviceAppDetails = doc.data();
            deviceAppDetails.firestoreDeviceAppId = doc.id;
            deviceAppArr.push(deviceAppDetails);
        });

        return deviceAppArr;
    } catch (error) {
        throw error;
    }
}

//  update All App Time Spent  //
const updateAllAppTimeSpent = async () => {
    try {
        const batch = db.batch();
        const snapshot = await db.collection('deviceApps').get()

        snapshot.forEach((element) => {
            batch.update(element.ref, {
                timeSpent: '0',
                remainingTime: '0'
            });
        });
        await batch.commit();
        return true;

    } catch (error) {
        throw error;
    }
}


//  update Device Apps By Id  //
const updateDeviceAppsById = async (deviceId) => {
    try {
        // Get a new write batch >>>>>>  update multiple data using batch
        const batch = db.batch();
        const sfRef = await db.collection('deviceApps').where("deviceId", "==", deviceId).get();

        await sfRef.forEach((element) => {
            batch.update(element.ref, {
                timeSpent: '0',
                remainingTime: '0'
            });
        });
        await batch.commit();
        return true;

    } catch (error) {
        throw error
    }
}



//  >>>>>>>>>>>  SETTINGS  >>>>>>>>>>>>> //
//  get settings details  //
const getSettings = async () => {
    try {
        const snapshot = await db.collection('settings').get();
        let settings = []

        snapshot.forEach(doc => {
            let settingsData = {};
            settingsData = doc.data();
            settingsData.settingsId = doc.id;

            settings.push(settingsData)
        });

        return settings[0];
    } catch (error) {
        throw error;
    }
}




module.exports = {
    getChildDataById,
    updateChildDataById,
    getAllConnectedDeviceData,
    updateAllDeviceTimeSpent,
    updateDeviceTimeSpentById,
    updateDeviceAppsById,
    getConnectedDeviceAppData,
    updateAllAppTimeSpent,
    getSettings,
}