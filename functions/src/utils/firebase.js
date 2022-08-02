const admin = require("firebase-admin");
const fs = require('fs').promises;
const https = require('https');
const { ref, Storage, getSignedUrl } = require('@firebase/storage');

// initialize firebase admin
const serviceAccount = require("../config/firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://kenandemo-bdb1d.appspot.com"
});

// to verify firebase token
const firebaseVerifyToken = async (token) => {
  try {
    const tokenDetails = await admin.auth().verifyIdToken(token);
    return tokenDetails;
  } catch (error) {
    return error;
  }
};

// to fetch firebase user
const firebaseUser = async (user) => {
  try {
    let authenticateUser = admin.auth().getUser(user);
    return authenticateUser;
  } catch (error) {
    return error;
  }
};


const firebaseNotification = async (message) => {
  try {
    let messageRes = await admin.messaging().send(message)
    return ({ "code": 200, "status": true })

  } catch (error) {
    return ({ "code": 404, "status": false });
  }
}

//  subscribe device with topic  //
const firebaseSubscribeTopicNotification = async (registrationTokens, topic) => {
  try {
    let messageRes = await admin.messaging().subscribeToTopic(registrationTokens, topic);
    return ({ "code": 200, "status": true })
  } catch (error) {
    return ({ "code": 404, "status": false });
  }
}

//  Send firebase topic notification  //
const firebaseSendTopicNotification = async (message) => {
  try {
    let messageRes = await admin.messaging().send(message);
    return ({ "code": 200, "status": true })
  } catch (error) {
    return ({ "code": 404, "status": false });
  }

}

//  Send firebase topic notification  //
const firebaseSendTopicNotificationTo = async (topic, payload) => {
  try {
    let messageRes = await admin.messaging().sendToTopic(topic, payload);
    return ({ "code": 200, "status": true, "data": messageRes })
  } catch (error) {
    return ({ "code": 404, "status": false, "data": error.message });
  }

}

//  Unsubscribe device from topic  //
const firebaseUnsubscribeTopicNotification = async (registrationTokens, topic) => {
  let messageRes = await admin.messaging().unsubscribeFromTopic(registrationTokens, topic)
  return true;
}




module.exports = {
  firebaseVerifyToken,
  firebaseUser,
  // createUser,
  // updateUserProfile,
  // disableProfile,
  // updateUser,
  firebaseNotification,
  firebaseSubscribeTopicNotification,
  firebaseSendTopicNotification,
  firebaseSendTopicNotificationTo,
  firebaseUnsubscribeTopicNotification,
};
