const { getFirestore, Timestamp, FieldValue, } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const db = getFirestore();
// db.settings({ ignoreUndefinedProperties: true });



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


module.exports = {
    getChildByParent,
    addChildByParent,
}