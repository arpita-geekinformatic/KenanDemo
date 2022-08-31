const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });


//  >>>>>>>>>>>>   ADMIN   >>>>>>>>>>  //
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




module.exports = {
    updateAllDeviceTimeSpent,
    updateAllAppTimeSpent,
}