const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



//>>>>>>>>>>>  DEVICES  >>>>>>>>>>>>>>>>>>//
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

//  update Device Data By Id  //
const updateDeviceDataById = async (firestoreDevicePathId, updatedData) => {
    try {
        let updateDeviceDataById = await db.collection("devices").doc(firestoreDevicePathId).update(updatedData);
        return true;

    } catch (error) {
        throw error;
    }
}


// >>>>>>>>>>>>>>>>  APPS  >>>>>>>>>>>>>> //
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


// >>>>>>>>>>>>>>>  DEVICE APPS  >>>>>>>>>>> //
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

//  get child device apps list (with app image) by device ID  //
const childDeviceAppList = async (deviceId) => {
    try {
        let deviceApps = await db.collection("deviceApps").where("deviceId", "==", deviceId).get();
        let deviceAppArr = [];
        deviceApps.forEach(async (doc) => {
            await deviceAppArr.push(doc.data());
        });

        for (const element of deviceAppArr) {
            let appDetails = await db.collection("apps").doc(element.firestoreAppId).get();
            let appImage = appDetails._fieldsProto.baseImage.stringValue;
            let image = appImage.replace(/\n/g, '');
            element.baseImage = image;
        }
        return deviceAppArr
    } catch (error) {
        throw error
    }
}

//  get child App Details By PackageName  //
const childAppDetailsByPackageName = async (deviceId, packageName) => {
    try {
        let childDeviceApp = await db.collection('deviceApps').where('deviceId', '==', deviceId).where('packageName', '==', packageName)

    } catch (error) {
        throw error
    }
}


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
            photo: childDetails._fieldsProto.photo.stringValue,
            authToken: childDetails._fieldsProto.authToken ? childDetails._fieldsProto.authToken.stringValue : '',
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


//  >>>>>>>>>>>>  PARENTS  >>>>>>>>>>>>>>> //
//  get parent data by firebase ID  //
const getParentDataById = async (parentId) => {
    try {
        let parentDetails = await db.collection("parents").doc(parentId).get();
        if (!parentDetails._fieldsProto) {
            return false;
        }
        if (parentDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let parentData = {
            parentId: parentDetails._ref._path.segments[1],
            name: parentDetails._fieldsProto.name ? parentDetails._fieldsProto.name.stringValue : '',
            email: parentDetails._fieldsProto.email ? parentDetails._fieldsProto.email.stringValue : '',
            authToken: parentDetails._fieldsProto.authToken ? parentDetails._fieldsProto.authToken.stringValue : '',
            isActive: parentDetails._fieldsProto.isActive ? parentDetails._fieldsProto.isActive.booleanValue : false,
            isDeleted: parentDetails._fieldsProto.isDeleted ? parentDetails._fieldsProto.isDeleted.booleanValue : false,
            fcmToken: parentDetails._fieldsProto.fcmToken ? parentDetails._fieldsProto.fcmToken.stringValue : '',
        }
        return parentData;
    } catch (error) {
        return (error)
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
    childAppDetailsByPackageName,
    getChildDataById,
    updateChildDataById,
    getParentDataById,
    childDeviceAppList,
}