const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });


//  >>>>>>>>>>>>   ADMIN   >>>>>>>>>>  //
//  find admin data  //
const findAdmin = async (email) => {
    try {
        
        return true
    } catch (error) {
        throw error;
    }
}





module.exports = {
    findAdmin,
}