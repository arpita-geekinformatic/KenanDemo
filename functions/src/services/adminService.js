const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



//  find admin data  //
const findAdmin = async (email) => {
    try {
        let adminRes = await db.collection("admin").where("email", "==", "admin@gmail.com").where("isDeleted", "==", false).limit(1).get();

        if (adminRes.empty) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

//  create admin //
const createAdminProfile = async (newData) => {
    try{
        let createAdmin = await db.collection("admin").add(newData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  add Gift Type  //
const addGiftType = async (newData) => {
    try{
        let addGift = await db.collection("giftTypes").add(newData);
        return true;

    } catch (error) {
        throw error;
    }
}




module.exports = {
    findAdmin,
    createAdminProfile,
    addGiftType,
}