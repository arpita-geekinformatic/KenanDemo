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

        let adminArr = [];
        adminRes.forEach(doc => {
            adminArr.push(doc.data())
            adminArr[0].adminId = doc.id
        })
        return adminArr[0];
    } catch (error) {
        throw error;
    }
}

//  find Admin By Token  //
const findAdminByToken = async (token) => {
    try {
        let adminRes = await db.collection("admin").where("authToken", "==", token).where("isDeleted", "==", false).limit(1).get();

        if (adminRes.empty) {
            return false;
        }

        let adminArr = [];
        adminRes.forEach(doc => {
            adminArr.push(doc.data())
            adminArr[0].adminId = doc.id
        })
        return adminArr[0];
    } catch (error) {
        throw error;
    }
}

//  create admin //
const createAdminProfile = async (newData) => {
    try {
        let createAdmin = await db.collection("admin").add(newData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  update Admin  //
const updateAdmin = async (adminId, newData) => {
    try {
        let updateAdmin = await db.collection("admin").doc(adminId).update(newData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  user List  //
const userList = async (limit, offset) => {
    try {
        // let userList = await db.collection("parents").where("isDeleted", "==", false).orderBy('name').select("name", "email", "isActive").limit(limit).offset(offset).get();
        let userList = await db.collection("parents").where("isDeleted", "==", false).orderBy('name').select("name", "email", "isActive").get();

        let userArr = [];
        userList.forEach(doc => {
            let userData = doc.data();

            userData.userId = doc.id;
            userArr.push(userData);
        });

        userArr.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

        let start = offset;
        let end = offset + limit
        let list = userArr.slice(start, end);

        return list;

    } catch (error) {
        throw error;
    }
}

//  total User Count  //
const totalUserCount = async () => {
    try {
        let totalUsers = 0;
        await db.collection('parents').where("isDeleted", "==", false).get().then(snap => {
            totalUsers = snap.size;
        });

        return totalUsers;
    } catch (error) {
        throw error;
    }
}

//  parent details By Id  //
const parentdetailsById = async (parentId) => {
    try {

        let parentDetails = await db.collection('parents').doc(parentId).get();

        if (!parentDetails._fieldsProto) {
            return false;
        }
        if (parentDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let parentData = {};
        parentData.parentId = parentId;
        parentData.name = parentDetails._fieldsProto.name ? parentDetails._fieldsProto.name.stringValue : "";
        parentData.email = parentDetails._fieldsProto.email ? parentDetails._fieldsProto.email.stringValue : "";
        parentData.isActive = parentDetails._fieldsProto.isActive ? parentDetails._fieldsProto.isActive.booleanValue : false;


        return parentData;
    } catch (error) {
        throw error;
    }
}

//  add Gift Type  //
const addGiftType = async (newData) => {
    try {
        let addGift = await db.collection("giftTypes").add(newData);
        return true;

    } catch (error) {
        throw error;
    }
}




module.exports = {
    findAdmin,
    findAdminByToken,
    createAdminProfile,
    updateAdmin,
    userList,
    totalUserCount,
    parentdetailsById,
    addGiftType,
}