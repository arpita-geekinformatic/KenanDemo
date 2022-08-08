const admin = require("firebase-admin");
const fs = require('fs').promises;
const https = require('https');
const { ref, Storage, getSignedUrl } = require('@firebase/storage');
const response = require("../utils/response");


// initialize firebase admin
const serviceAccount = require("../config/firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://kenandemo-bdb1d.appspot.com"
});

// Cloud storage
const bucket = admin.storage().bucket();

const uploadImage = async (res, req) => {
  console.log("******  req : ", req.files);
  const ref = admin.storage().bucket();

  const file = req.files[0];
  const name =new Date() + '-' + file.name;

  const metadata = {
    contentType: file.type
  }

  const task = ref.child(name).put(file, metadata);
  task
  .then(snapshot => snapshot.ref.getDownloadUrl())
  .then(url => {
    console.log(">>>>> url : ",url)
  })

}


//  uploadImage  //
const fileUpload = async (res, req) => {
  console.log("?????????? req.file : ", req.files);
  if (req.files.length == 0) {
    return response.success(res, 200, "No files found");
  }

  const blob = bucket.file(req.file.filename);
  console.log(">>>>>>>>>>. blob : ", blob);

  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  })
  blobWriter.on('error', (err) => {
    console.log("*********** err : ", err)
  })
  blobWriter.on('finish', () => {
    console.log(">>>>>>>>> finish : ")
    // return response.success(res, 200, "File uploaded.");
  })
  console.log(">>>>>>>>>>. blobWriter : ", blobWriter);
  blobWriter.end(req.file.buffer)

}


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
  uploadImage,
  fileUpload,
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
