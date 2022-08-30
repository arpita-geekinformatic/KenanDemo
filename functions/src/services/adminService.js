const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });


//  >>>>>>>>>>>>   ADMIN   >>>>>>>>>>  //
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




//  >>>>>>>>>>>>   PARENTS   >>>>>>>>>>  //
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
        parentData.photo = parentDetails._fieldsProto.photo ? parentDetails._fieldsProto.photo.stringValue : "";

        let allChildArr = parentDetails._fieldsProto.childId ? parentDetails._fieldsProto.childId.arrayValue.values : [];
        if(allChildArr.length > 0){
            let allchildId = [];
            for(let data of allChildArr){
                allchildId.push(data.stringValue)
            }
            parentData.childId = allchildId
        }
        else {
            parentData.childId = allChildArr
        }

        return parentData;
    } catch (error) {
        throw error;
    }
}

//  update Parent By Id  //
const updateParentById = async (parentId, newData) => {
    try {
        let updateAdmin = await db.collection("parents").doc(parentId).update(newData);
        return true;

    } catch (error) {
        throw error;
    }
}



//  >>>>>>>>>>>>   CHILDS   >>>>>>>>>>  //
//  delete all childs by parent Id  //
const deleteChildsByParentsId = async (parentId) => {
    try {
        let childData = await db.collection('childs').where("parentId", "==", parentId).where("isDeleted", "==", false).select('name', 'parentId', 'email', 'deviceId').get();

        let childArr = [];
        childData.forEach(doc => {
            let childDetails = doc.data();
            childDetails.childId = doc.id;
            childArr.push(childDetails);
        });

        const batch = db.batch();
        await childData.forEach((element) => {
            batch.update(element.ref, {
                isDeleted: true,
                parentId: '',
                deviceId: ''
            });
        });
        await batch.commit();

        return childArr;
    } catch (error) {
        throw error;
    }
}

//  child List By Parent Id  //
const childListByParentId = async (parentId) => {
    try {
        let childData = await db.collection('childs').where("parentId", "==", parentId).where("isDeleted", "==", false).select('name', 'parentId', 'email', 'deviceId', 'photo', 'gender').orderBy('name', 'asc').get();

        let childArr = [];
        childData.forEach(doc => {
            let childDetails = doc.data();
            childDetails.childId = doc.id;
            childArr.push(childDetails);
        });

        return childArr;
    } catch (error) {
        throw error;
    }
}

//  all Child List  //
const allChildList = async (limit, offset) => {
    try {
        let childData = await db.collection('childs').where("isDeleted", "==", false).select('name', 'parentId', 'email', 'deviceId', 'photo', 'gender').orderBy('name', 'asc').get();

        let childArr = [];
        childData.forEach(doc => {
            let childDetails = doc.data();
            childDetails.childId = doc.id;
            childArr.push(childDetails);
        });

        childArr.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

        let start = offset;
        let end = offset + limit
        let list = childArr.slice(start, end);

        return list;
    } catch (error) {
        throw error;
    }
}

//  total Child Count  //
const totalChildCount = async () => {
    try {
        let totalchilds = 0;
        await db.collection('childs').where("isDeleted", "==", false).get().then(snap => {
            totalchilds = snap.size;
        });

        return totalchilds;
    } catch (error) {
        throw error;
    }
}

//  child Details By Id  //
const childDetailsById = async (childId) => {
    try {
        let childDetails = await db.collection('childs').doc(childId).get();

        if (!childDetails._fieldsProto) {
            return false;
        }
        if (childDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let childData = {};
        childData.childId = childId;
        childData.name = childDetails._fieldsProto.name ? childDetails._fieldsProto.name.stringValue : "";
        childData.email = childDetails._fieldsProto.email ? childDetails._fieldsProto.email.stringValue : "";
        childData.gender = childDetails._fieldsProto.gender ? childDetails._fieldsProto.gender.stringValue : "";
        childData.deviceId = childDetails._fieldsProto.deviceId ? childDetails._fieldsProto.deviceId.stringValue : "";
        childData.age = childDetails._fieldsProto.age ? childDetails._fieldsProto.age.integerValue : 0;
        childData.badge = childDetails._fieldsProto.badge ? childDetails._fieldsProto.badge.integerValue : 0;
        childData.points = childDetails._fieldsProto.points ? childDetails._fieldsProto.points.integerValue : 0;
        childData.photo = childDetails._fieldsProto.photo ? childDetails._fieldsProto.photo.stringValue : "";
        childData.parentId = childDetails._fieldsProto.parentId ? childDetails._fieldsProto.parentId.stringValue : "";
        childData.fcmToken = childDetails._fieldsProto.fcmToken ? childDetails._fieldsProto.fcmToken.stringValue : "";

        return childData;
    } catch (error) {
        throw error;
    }
}

//  update Child Data By Id  //
const updateChildDataById = async (childId, updatedData) => {
    try {
        let childDetails = await db.collection('childs').doc(childId).update(updatedData);
        return true;

    } catch (error) {
        throw error;
    }
}




//  >>>>>>>>>>>>   DEVICES   >>>>>>>>>>  //
//  delete Connected Chield Device  //
const deleteConnectedChildDevice = async (allChildDeviceIdArr) => {
    try {
        let updatedData = {
            childId: '',
            parentId: ''
        }

        for (let deviceId of allChildDeviceIdArr) {
            const batch = db.batch();
            let deviceData = await db.collection('devices').where('deviceId', '==', deviceId).get();
            await deviceData.forEach((element) => {
                batch.update(element.ref, updatedData)
            })
            await batch.commit();
        }

        return true;
    } catch (error) {
        throw error;
    }
}

//  update Device Data  //
const updateDeviceData = async (deviceId, updatedData) => {
    try {
        const batch = db.batch();
        let deviceData = await db.collection('devices').where('deviceId', '==', deviceId).get();
        await deviceData.forEach((element) => {
            batch.update(element.ref, updatedData)
        })
        await batch.commit();

        return true
    } catch (error) {
        throw error;
    }
}



//  >>>>>>>>>>>>   GIFT TYPES   >>>>>>>>>>  //
//  add Gift Type  //
const addGiftType = async (newData) => {
    try {
        let addGift = await db.collection("giftTypes").add(newData);
        return true;

    } catch (error) {
        throw error;
    }
}

//  giftT ype List  //
const giftTypeList = async () => {
    try {
        let giftList = await db.collection("giftTypes").where("isDeleted", "==", false).orderBy('name', 'asc').get();

        let giftArr = [];
        giftList.forEach(doc => {
            let giftData = doc.data();
            giftData.giftId = doc.id;

            giftArr.push(giftData);
        });

        // giftArr.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

        return giftArr;

    } catch (error) {
        throw error;
    }
}

//  gift Type Details By Id  //
const giftTypeDetailsById = async (giftTypeId) => {
    try {
        let giftTypeDetails = await db.collection('giftTypes').doc(giftTypeId).get();

        if (!giftTypeDetails._fieldsProto) {
            return false;
        }
        if (giftTypeDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let giftTypeData = {};
        giftTypeData.giftTypeId = giftTypeId;
        giftTypeData.name = giftTypeDetails._fieldsProto.name ? giftTypeDetails._fieldsProto.name.stringValue : "";
        giftTypeData.icon = giftTypeDetails._fieldsProto.icon ? giftTypeDetails._fieldsProto.icon.stringValue : "";

        return giftTypeData;

    } catch (error) {
        throw error;
    }
}

//  update Gift Type By Id  //
const updateGiftTypeById = async (giftTypeId, updatedData) => {
    try {
        let updateGiftTypeById = await db.collection('giftTypes').doc(giftTypeId).update(updatedData);
        return true

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
    updateParentById,
    deleteChildsByParentsId,
    childListByParentId,
    allChildList,
    totalChildCount,
    childDetailsById,
    updateChildDataById,
    deleteConnectedChildDevice,
    updateDeviceData,
    addGiftType,
    giftTypeList,
    giftTypeDetailsById,
    updateGiftTypeById,
}