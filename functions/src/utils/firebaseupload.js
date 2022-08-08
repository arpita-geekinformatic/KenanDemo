// const serviceAccount = require("../config/firebase.json");
// const admin = require('firebase-admin');

// // initialize firebase admin
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "gs://kenandemo-bdb1d.appspot.com"
// });

// // Cloud storage
// const bucket = admin.storage().bucket()

// module.exports = {
//   bucket
// }

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// const serviceAccount = require("./src/config/firebase.json");
// const {Storage} = require('@google-cloud/storage');
// const dbstorage =new Storage({
//   projectId: "kenandemo-bdb1d",
//   keyFilename: serviceAccount
// });
// const bucket = dbstorage.bucket("gs://kenandemo-bdb1d.appspot.com");


// const uploadImageToStorage = (file) => {
//   return new Promise((resolve, reject) => {
//     if (!file) {
//       reject('No image file');
//     }
//     let newFileName = `${file.originalname}_${Date.now()}`;

//     let fileUpload = bucket.file(newFileName);

//     const blobStream = fileUpload.createWriteStream({
//       metadata: {
//         contentType: file.mimetype
//       }
//     });

//     blobStream.on('error', (error) => {
//       reject('Something is wrong! Unable to upload at the moment.');
//     });

//     blobStream.on('finish', () => {
//       // The public URL can be used to directly access the file via HTTP.
//       const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
//       resolve(url);
//     });

//     blobStream.end(file.buffer);
//   });
// }
