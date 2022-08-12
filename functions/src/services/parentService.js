
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

//  update specific field of parent profile by firebase ID  //
const updateSpecificParentData = async (parentId, updateData) => {
    try {
        await db.collection("parents").doc(parentId).update(updateData);
        return true;
    } catch (error) {
        throw error;
    }
}

//  find parent by Token  //
const findParentByToken = async (authToken) => {
    try {
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
    } catch (error) {
        throw error;
    }
}

//  get parent data by otp  //
const getParentDataByOTP = async (bodyData) => {
    try {
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
    } catch (error) {
        throw error;
    }
}

//  get child details by name and Parent ID  // 
const getChildByParent = async (childName, parentId) => {
    try {
        let childRes = await db.collection("childs").where("name", "==", childName).where("parentId", "==", parentId).where("isDeleted", "==", false).limit(1).get();

        if (childRes.empty) {
            return false;
        }

        let childArr = [];
        childRes.forEach(doc => {
            childArr.push(doc.data())
            childArr[0].firestore_childId = doc.id
        })
        return childArr[0];

    } catch (error) {
        throw error;
    }
}

//  add child By Parent  //
const addChildByParent = async (newData) => {
    try {
        let addChild = await db.collection("childs").add(newData);
        return addChild.id;
    } catch (error) {
        throw error;
    }
}

//  get Child List by Parent Id  //
const getChildList = async (parentId) => {
    try {
        let childArr = [];
        let childList = await db.collection("childs").where('parentId', '==', parentId).where('isDeleted', '==', false).get();
        childList.forEach(doc => {
            let childData = doc.data();
            if (!childData.isDeleted) {
                childData.firestore_childId = doc.id;
                childArr.push(childData);
            }
        });
        return childArr;
    } catch (error) {
        throw error;
    }
}

//  getChildDataById  //
const getChildDataById = async (childId) => {
    try {
        let childDetails = await db.collection("childs").doc(childId).get();
        if (!childDetails._fieldsProto) {
            return false;
        }
        if (childDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let childData = {};
        childData.childId = childId;
        childData.name = childDetails._fieldsProto.name ? childDetails._fieldsProto.name.stringValue : "";
        childData.age = childDetails._fieldsProto.age ? childDetails._fieldsProto.age.integerValue : 0;
        childData.deviceId = childDetails._fieldsProto.deviceId ? childDetails._fieldsProto.deviceId.stringValue : "";
        childData.email = childDetails._fieldsProto.email ? childDetails._fieldsProto.email.stringValue : "";
        childData.fcmToken = childDetails._fieldsProto.fcmToken ? childDetails._fieldsProto.fcmToken.stringValue : "";
        childData.gender = childDetails._fieldsProto.gender ? childDetails._fieldsProto.gender.stringValue : "";
        childData.parentId = childDetails._fieldsProto.parentId ? childDetails._fieldsProto.parentId.stringValue : "";
        childData.photo = childDetails._fieldsProto.photo ? childDetails._fieldsProto.photo.stringValue : "";
        childData.points = childDetails._fieldsProto.points ? childDetails._fieldsProto.points.integerValue : 0;
        childData.badge = childDetails._fieldsProto.badge ? childDetails._fieldsProto.badge.integerValue : 0;

        return childData;
    } catch (error) {
        throw error;
    }
}

//  deleteChildById  //
const deleteChildById = async (childId) => {
    try {
        let childDetails = await db.collection("childs").doc(childId).update({ isDeleted: true });
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

//  get device apps by packageName  //
const getDeviceAppsIdByPackageName = async (deviceId, packageName) => {
    try {
        let deviceAppData = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("packageName", "==", packageName).get();

        let firestoreDeviceAppId;
        deviceAppData.forEach(doc => {
            firestoreDeviceAppId = doc.id;
        });
        console.log(">>>>>>>... firestoreDeviceAppId : ", firestoreDeviceAppId);
        return firestoreDeviceAppId
    } catch (error) {
        throw error
    }
}

//  update Device Apps By ID   //
const updateDeviceAppsById = async (deviceAppId, updatedData) => {
    try {
        let deviceAppData = await db.collection("deviceApps").doc(deviceAppId).update(updatedData).get();
        return true

    } catch (error) {
        throw error
    }
}

//  gift Type Dropdown  //
const giftTypeDropdown = async () => {
    try {
        let giftList = await db.collection("giftTypes").where("isDeleted", "==", false).get();
        let giftListArr = [];

        giftList.forEach(doc => {
            let giftData = {}
            giftData.giftId = doc.id;
            giftData.name = doc.data().name;
            giftData.icon = doc.data().icon;

            giftListArr.push(giftData);
        })
        return giftListArr;

    } catch (error) {
        throw error
    }
}

//  add Gift for child  //
const addGift = async (giftData) => {
    try {
        let addGift = await db.collection("childGifts").add(giftData);
        return true;

    } catch (error) {
        throw error
    }
}

//  child Gift List By Id  //
const childGiftListById = async (childId, parentId) => {
    try {
        let childGiftList = await db.collection("childGifts").where("childId", "==", childId).where("parentId", "==", parentId).where("isDeleted", "==", false).get();

        let childGiftListArr = [];
        childGiftList.forEach(doc => {
            let giftData = {}
            giftData.childGiftId = doc.id;
            giftData.giftIcon = doc.data().giftIcon;
            giftData.giftName = doc.data().giftName;
            giftData.points = doc.data().points;

            childGiftListArr.push(giftData);
        })
        return childGiftListArr;

    } catch (error) {
        throw error
    }
}

//  delete Child Gift By Id  //
const deleteChildGiftById = async (giftId) => {
    try {
        await db.collection("childGifts").doc(giftId).update({isDeleted : true});
        return true;

    } catch (error) {
        throw error
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
    getChildByParent,
    addChildByParent,
    getChildList,
    getChildDataById,
    deleteChildById,
    childDeviceAppList,
    getDeviceAppsIdByPackageName,
    updateDeviceAppsById,
    giftTypeDropdown,
    addGift,
    childGiftListById,
    deleteChildGiftById,
}