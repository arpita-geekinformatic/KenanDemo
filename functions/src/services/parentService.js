
const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



//  >>>>>>>>>>>>  PARENTS  >>>>>>>>>>>>>>> //
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

        let parentDetails = {
            firestore_parentId: parentArr[0].firestore_parentId,
            name: parentArr[0].name || '',
            email: parentArr[0].email,
            isActive: parentArr[0].isActive,
            childId: parentArr[0].childId,
            isBlocked: parentArr[0].isBlocked,
            authToken: parentArr[0].authToken || '',
            fcmToken: parentArr[0].fcmToken || '',
            photo: parentArr[0].photo || '',
            password: parentArr[0].password || '',
            socialId: parentArr[0].socialId || '',
        }
        return parentDetails;

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
            childId: parentDetails._fieldsProto.childId ? parentDetails._fieldsProto.childId.arrayValue.values : [],
            isBlocked: parentDetails._fieldsProto.isBlocked ? parentDetails._fieldsProto.isBlocked.booleanValue : false,
            photo: parentDetails._fieldsProto.photo ? parentDetails._fieldsProto.photo.stringValue : '',
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

        let parentDetails = {
            firestore_parentId: parentArr[0].firestore_parentId,
            name: parentArr[0].name || '',
            email: parentArr[0].email,
            isActive: parentArr[0].isActive,
            childId: parentArr[0].childId,
            isBlocked: parentArr[0].isBlocked,
            authToken: parentArr[0].authToken || '',
            fcmToken: parentArr[0].fcmToken || '',
            photo: parentArr[0].photo || '',
            password: parentArr[0].password || '',
            socialId: parentArr[0].socialId || ''
        }

        return parentDetails;
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



//  >>>>>>>>>>>>  CHILDS  >>>>>>>>>>>>>>> //
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

//  update Child Data By Id  //
const updateChildDataById = async (childId, updateData) => {
    try {
        let updatechild = await db.collection('childs').doc(childId).update(updateData);
        return true;

    } catch (error) {
        throw error;
    }
}



//  >>>>>>>>>>>>  DEVICE APPS  >>>>>>>>>>>>>>> //
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
        return firestoreDeviceAppId
    } catch (error) {
        throw error
    }
}

//  get Device Apps Id By Package Name And Id  //
const getDeviceAppsIdByPackageNameAndId = async (deviceId, packageName) => {
    try {
        let deviceAppData = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("packageName", "==", packageName).get();

        let firestoreDeviceAppId;
        deviceAppData.forEach(doc => {
            firestoreDeviceAppId = doc.id;
        });
        return firestoreDeviceAppId
    } catch (error) {
        throw error
    }
}

//  update Device Apps By ID   //
const updateDeviceAppsById = async (deviceAppId, updatedData) => {
    try {
        let deviceAppData = await db.collection("deviceApps").doc(deviceAppId).update(updatedData);
        return true

    } catch (error) {
        throw error
    }
}

//  device Apps Everyday Schedule  //
const deviceAppsEverydaySchedule = async (deviceId, packageName) => {
    try {
        let deviceApps = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("packageName", "!=", packageName).where("scheduledBy", "==", 'everyDay').get();
        let deviceAppArr = [];
        deviceApps.forEach(async (doc) => {
            await deviceAppArr.push(doc.data());
        });

        let totalEveryDaySchedule = 0;
        if (deviceAppArr.length > 0) {
            for (let everyDayData of deviceAppArr) {
                totalEveryDaySchedule = (everyDayData.everyDaySchedule != '') ? parseInt(totalEveryDaySchedule) + parseInt(everyDayData.everyDaySchedule) : totalEveryDaySchedule
            }
        }

        return totalEveryDaySchedule
    } catch (error) {
        throw error
    }
}

//  device Apps Eachday Schedule  //
const deviceAppsEachdaySchedule = async (deviceId, packageName, dayName) => {
    try {
        let deviceApps = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("packageName", "!=", packageName).where("scheduledBy", "==", 'eachDay').get();
        let deviceAppArr = [];
        deviceApps.forEach(async (doc) => {
            await deviceAppArr.push(doc.data());
        });

        const finalEachDayAppArr = []
        let allEachDayScheduleArr = await deviceAppArr.filter(async (element) => {
            let appsEachDaySchedule = await element.eachDaySchedule.filter(data => {
                return ((data.day.toLowerCase() == dayName.toLowerCase()) && (data.status == true))
            })
            if (appsEachDaySchedule.length > 0) {
                finalEachDayAppArr.push(appsEachDaySchedule[0])
            }
        })

        let totalEachDaySchedule = 0;
        if (finalEachDayAppArr.length > 0) {
            for (let eachDayData of finalEachDayAppArr) {
                totalEachDaySchedule = (eachDayData.time != '') ? parseInt(totalEachDaySchedule) + parseInt(eachDayData.time) : totalEachDaySchedule
            }
        }

        return totalEachDaySchedule
    } catch (error) {
        throw error
    }

}

//  all Device Apps Everyday Schedule  //
const allDeviceAppsEverydaySchedule = async (deviceId) => {
    try {
        let deviceApps = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("scheduledBy", "==", 'everyDay').get();
        let deviceAppArr = [];
        deviceApps.forEach(async (doc) => {
            await deviceAppArr.push(doc.data());
        });

        let totalEveryDaySchedule = 0;
        if (deviceAppArr.length > 0) {
            for (let everyDayData of deviceAppArr) {
                totalEveryDaySchedule = (everyDayData.everyDaySchedule != '') ? parseInt(totalEveryDaySchedule) + parseInt(everyDayData.everyDaySchedule) : totalEveryDaySchedule
            }
        }

        return totalEveryDaySchedule
    } catch (error) {
        throw error
    }
}

//  all Device Apps Eachday Schedule  //
const allDeviceAppsEachdaySchedule = async (deviceId, dayName) => {
    try {
        let deviceApps = await db.collection("deviceApps").where("deviceId", "==", deviceId).where("scheduledBy", "==", 'eachDay').get();
        let deviceAppArr = [];
        deviceApps.forEach(async (doc) => {
            await deviceAppArr.push(doc.data());
        });

        const finalEachDayAppArr = []
        let allEachDayScheduleArr = await deviceAppArr.filter(async (element) => {
            let appsEachDaySchedule = await element.eachDaySchedule.filter(data => {
                return ((data.day.toLowerCase() == dayName.toLowerCase()) && (data.status == true))
            })
            if (appsEachDaySchedule.length > 0) {
                finalEachDayAppArr.push(appsEachDaySchedule[0])
            }
        })

        let totalEachDaySchedule = 0;
        if (finalEachDayAppArr.length > 0) {
            for (let eachDayData of finalEachDayAppArr) {
                totalEachDaySchedule = (eachDayData.time != '') ? parseInt(totalEachDaySchedule) + parseInt(eachDayData.time) : totalEachDaySchedule
            }
        }

        return totalEachDaySchedule
    } catch (error) {
        throw error
    }

}




//  >>>>>>>>>>>>  DEVICE   >>>>>>>>>>>>>>> //
//  update Device Data By Id  //
const updateDeviceDataById = async (deviceId, updatedData) => {
    try {
        const batch = db.batch();
        let deviceData = await db.collection('devices').where('deviceId', '==', deviceId).get();
        await deviceData.forEach((element) => {
            batch.update(element.ref, updatedData)
        })
        await batch.commit();

        return true;
    } catch (error) {
        throw error
    }
}

//  get Device Data By Id  //
const getDeviceDataById = async (deviceId) => {
    try {
        let deviceData = await db.collection('devices').where('deviceId', '==', deviceId).get();

        if (deviceData.empty) {
            return false;
        }

        let deviceArr = [];
        deviceData.forEach(doc => {
            deviceArr.push(doc.data())
            deviceArr[0].firestoreDeviceId = doc.id
        })

        return deviceArr[0];
    } catch (error) {
        throw error
    }
}



//  >>>>>>>>>>>>  GIFT TYPES   >>>>>>>>>>>>>>> //
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
        giftListArr.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
        return giftListArr;

    } catch (error) {
        throw error
    }
}



//  >>>>>>>>>>>>  CHILD GIFTS   >>>>>>>>>>>>>>> //
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
            giftData.redeemGift = doc.data().redeemGift;

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
        await db.collection("childGifts").doc(giftId).update({ isDeleted: true });
        return true;

    } catch (error) {
        throw error
    }
}



//  >>>>>>>>>>>>  NOTIFICATIONS   >>>>>>>>>>>>>>> //
//  notification List  //
const notificationList = async (receiverId) => {
    try {
        let notificationData = await db.collection("notifications").where("receiverId", "==", receiverId).where("isDeleted", "==", false).orderBy('messageTime', 'desc').get();

        let notificationListArr = [];
        notificationData.forEach(doc => {
            let notificationDetails = doc.data()
            notificationDetails.notificationId = doc.id;

            notificationListArr.push(notificationDetails);
        })
        return notificationListArr;

    } catch (error) {
        throw error
    }
}

//  all Parent Notification Delete  //
const allParentNotificationDelete = async (receiverId) => {
    try {
        // Get a new write batch >>>>>>  update multiple data using batch
        const batch = db.batch();
        const sfRef = await db.collection('notifications').where("receiverId", "==", receiverId).orderBy('messageTime', 'desc').get();

        await sfRef.forEach((element) => {
            batch.update(element.ref, {
                isDeleted: true,
            });
        });
        await batch.commit();
        return true;

    } catch (error) {
        throw error
    }
}

//  notification Delete By Id  //
const notificationDeleteById = async (notificationId) => {
    try {
        let deleteNotification = await db.collection('notifications').doc(notificationId).update({ isDeleted: true });
        return true
    } catch (error) {
        throw error
    }
}

//  gift Notification Details by Id  //
const giftNotificationDetails = async (notificationId) => {
    try {
        let giftNotificationDetails = await db.collection('notifications').doc(notificationId).get();

        if (!giftNotificationDetails._fieldsProto) {
            return false;
        }
        if (giftNotificationDetails._fieldsProto.isDeleted.booleanValue) {
            return false;
        }

        let notificationData = {};
        notificationData.notificationId = notificationId;
        notificationData.childDeviceId = giftNotificationDetails._fieldsProto.childDeviceId ? giftNotificationDetails._fieldsProto.childDeviceId.stringValue : '';
        notificationData.senderId = giftNotificationDetails._fieldsProto.senderId ? giftNotificationDetails._fieldsProto.senderId.stringValue : '';
        notificationData.senderImage = giftNotificationDetails._fieldsProto.senderImage ? giftNotificationDetails._fieldsProto.senderImage.stringValue : '';
        notificationData.receiverId = giftNotificationDetails._fieldsProto.receiverId ? giftNotificationDetails._fieldsProto.receiverId.stringValue : '';
        notificationData.messageTime = giftNotificationDetails._fieldsProto.messageTime ? giftNotificationDetails._fieldsProto.messageTime.stringValue : '';
        notificationData.isMarked = giftNotificationDetails._fieldsProto.isMarked ? giftNotificationDetails._fieldsProto.isMarked.booleanValue : false;
        notificationData.notificationType = giftNotificationDetails._fieldsProto.notificationType ? giftNotificationDetails._fieldsProto.notificationType.integerValue : 1;
        notificationData.receiverImage = giftNotificationDetails._fieldsProto.receiverImage ? giftNotificationDetails._fieldsProto.receiverImage.stringValue : '';
        notificationData.message = giftNotificationDetails._fieldsProto.message ? giftNotificationDetails._fieldsProto.message.mapValue.fields : [];
        notificationData.giftName = giftNotificationDetails._fieldsProto.giftName ? giftNotificationDetails._fieldsProto.giftName.stringValue : '';
        notificationData.notificationStatus = giftNotificationDetails._fieldsProto.notificationStatus ? giftNotificationDetails._fieldsProto.notificationStatus.stringValue : '';
        notificationData.giftPoint = giftNotificationDetails._fieldsProto.giftPoint ? giftNotificationDetails._fieldsProto.giftPoint.stringValue : '0';

        return notificationData;

    } catch (error) {
        throw error
    }
}

//  update Notification By Id  //
const updateNotificationById = async (notificationId, updatedData) => {
    try {
        let updateNotificationById = await db.collection('notifications').doc(notificationId).update(updatedData);
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
    updateChildDataById,
    childDeviceAppList,
    getDeviceAppsIdByPackageName,
    getDeviceAppsIdByPackageNameAndId,
    updateDeviceAppsById,
    deviceAppsEverydaySchedule,
    deviceAppsEachdaySchedule,
    allDeviceAppsEverydaySchedule,
    allDeviceAppsEachdaySchedule,
    updateDeviceDataById,
    getDeviceDataById,
    giftTypeDropdown,
    addGift,
    childGiftListById,
    deleteChildGiftById,
    notificationList,
    allParentNotificationDelete,
    notificationDeleteById,
    giftNotificationDetails,
    updateNotificationById,
    getSettings,
}