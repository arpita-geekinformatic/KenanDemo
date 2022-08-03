
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



//  is user exists //
const isParentExists = async (email) => {
    try {
        let parentRes = await db.collection("parents").where("email", "==", email).where("isDeleted", "==", false).limit(1).get();

        if (parentRes.empty) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

//  create parent profile  //
const createParentProfile = async (newData) => {
    try {
        let createParent = await db.collection("parents").add(newData);
        return createParent.id;

    } catch (error) {
        throw error;
    }
}

//  get parent data by Email  //
const getParentDataByEmail = async (email) => {
    try {
        let parentRes = await db.collection("parents").where("email", "==", email).where("isDeleted", "==", false).limit(1).get();

        if (parentRes.empty) {
            return false;
        }

        let parentArr = [];
        parentRes.forEach(doc => {
            parentArr.push(doc.data())
            parentArr[0].firestore_parentId = doc.id
        })
        return parentArr[0];
    } catch (error) {
        throw error;
    }
}

//  update parent data by firestore ID  //
const updateParentDataById = async (firestoreId, newData) => {
    try {
        await db.collection("parents").doc(firestoreId).update(newData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  get parent data by firebase ID  //
const getParentDataById = async(parentId) => {
    try {
        let parentDetails = await db.collection("parents").doc(parentId).get();
        if (!parentDetails._fieldsProto) {
            return false;
        }
        let parentData = {
            firestore_parentId: parentDetails._ref._path.segments[1],
            name: parentDetails._fieldsProto.name ? parentDetails._fieldsProto.name.stringValue : '',
            email: parentDetails._fieldsProto.email ? parentDetails._fieldsProto.email.stringValue : '',
            authToken: parentDetails._fieldsProto.authToken ? parentDetails._fieldsProto.authToken.stringValue : '',
            isActive: parentDetails._fieldsProto.isActive ? parentDetails._fieldsProto.isActive.booleanValue : false,
            isDeleted: parentDetails._fieldsProto.isDeleted ? parentDetails._fieldsProto.isDeleted.booleanValue : false,

            // fcmToken: parentDetails._fieldsProto.fcmToken ? parentDetails._fieldsProto.fcmToken.stringValue : '',
        }
        return parentData;
    } catch (error) {
        return (error)
    }
}

//  update specific field of parent profile by firebase ID  //
const updateSpecificParentData = async(parentId, updateData) => {
    try{
        await db.collection("parents").doc(parentId).update(updateData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  find parent by Token  //
const findParentByToken = async(authToken) => {
    try{
        let parentRes = await db.collection("parents").where("authToken", "==", authToken).where("isDeleted", "==", false).limit(1).get();

        if (parentRes.empty) {
            return false;
        }

        let parentArr = [];
        parentRes.forEach(doc => {
            parentArr.push(doc.data())
            parentArr[0].firestore_parentId = doc.id
        })
        return parentArr[0];
    }catch (error) {
        throw error;
    }
}

//  get parent data by otp  //
const getParentDataByOTP =  async(bodyData) => {
    try{
        let parentRes = await db.collection("parents").where("email", "==", bodyData.email).where("otp", "==", bodyData.otp).where("isDeleted", "==", false).limit(1).get();

        if (parentRes.empty) {
            return false;
        }

        let parentArr = [];
        parentRes.forEach(doc => {
            parentArr.push(doc.data())
            parentArr[0].firestore_parentId = doc.id
        })
        return parentArr[0];
    }catch (error) {
        throw error;
    }
}








//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//  Add new user  // 
const addUser = async (newData) => {
    try {
        let addNewUser = await db.collection("users").add(newData);
        return addNewUser.id;
    } catch (error) {
        throw error;
    }
}

//   Get parent data by Email  //
const getParentByEmail = async (email) => {
    try {
        let userRes = await db.collection("users").where("email", "==", email).limit(1).get();
        return userRes;
    } catch (error) {
        throw error;
    }
}

//   Get parent by EMAIL and update data  //
const getParentByEmailandUpdate = async (email) => {
    try {
        let parentDetails = await db.collection("users").where("email", "==", email).limit(1).get();

        parentDetails.forEach(async (doc) => {
            let newData = {
                fcmToken: "",
                // firebaseResponse: "{}"
            }
            await updateParentById(doc.id, newData);
        })
        return true;
    } catch (error) {
        throw error;
    }
}

//   Get parent by ID  //
const getParentById = async (userId) => {
    try {
        let parentDetails = await db.collection("users").doc(userId).get();
        if (!parentDetails._fieldsProto) {
            return false;
        }
        let parentData = {
            id: parentDetails._ref._path.segments[1],
            name: parentDetails._fieldsProto.name ? parentDetails._fieldsProto.name.stringValue : '',
            email: parentDetails._fieldsProto.email ? parentDetails._fieldsProto.email.stringValue : '',
            phone: parentDetails._fieldsProto.phone ? parentDetails._fieldsProto.phone.stringValue : '',
            picture: parentDetails._fieldsProto.picture ? parentDetails._fieldsProto.picture.stringValue : '',
            uid: parentDetails._fieldsProto.uid ? parentDetails._fieldsProto.uid.stringValue : '',
            fcmToken: parentDetails._fieldsProto.fcmToken ? parentDetails._fieldsProto.fcmToken.stringValue : '',
            dob: parentDetails._fieldsProto.dob ? parentDetails._fieldsProto.dob.stringValue : '',
            gender: parentDetails._fieldsProto.gender ? parentDetails._fieldsProto.gender.stringValue : '',
            firstName: parentDetails._fieldsProto.firstName ? parentDetails._fieldsProto.firstName.stringValue : '',
            lastName: parentDetails._fieldsProto.lastName ? parentDetails._fieldsProto.lastName.stringValue : '',
            countryCode: parentDetails._fieldsProto.countryCode ? parentDetails._fieldsProto.countryCode.stringValue : '',
        }
        return parentData;
    } catch (error) {
        return (error)
    }
}

//   Update parent by ID  //
const updateParentById = async (userId, newData) => {
    try {
        await db.collection("users").doc(userId).update(newData);
        return true;
    } catch (error) {
        return (error);
    }
}









module.exports = {
    isParentExists,
    createParentProfile,
    getParentDataByEmail,
    updateParentDataById,
    getParentDataById,
    updateSpecificParentData,
    findParentByToken,
    getParentDataByOTP,


    addUser,
    getParentByEmail,
    getParentByEmailandUpdate,
    getParentById,
    updateParentById,
}