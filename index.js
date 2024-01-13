// functions/index.js
const { initializeApp } = require("firebase/app");
const admin = require('firebase-admin');
const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSrvugxQrHCpKw6Q7vbJeKD9h5HwAP1ho",
  authDomain: "contact-adcf7.firebaseapp.com",
  projectId: "contact-adcf7",
  storageBucket: "contact-adcf7.appspot.com",
  messagingSenderId: "858093416934",
  appId: "1:858093416934:web:07a4a90cd0ed6423226627",
  measurementId: "G-64SJ24HW4B"
};
const serviceAccount = require('./contact-adcf7-firebase-adminsdk-76eum-6cea42ca4d.json');


// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://contact-adcf7.appspot.com',
});

const app = express();  // Declare app once

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filename = `${Date.now()}_${path.basename(req.file.originalname)}`;
    const filePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const storageBucket = admin.storage().bucket();
    await storageBucket.upload(filePath, {
      destination: `images/${filename}`,
    });

    const file = storageBucket.file(`images/${filename}`);
    const [metadata] = await file.getMetadata();
    const downloadURL = metadata.mediaLink;

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

app.post('/upload', upload.single('image'), uploadImageHandler);

const PORT = 3000;  // Use the environment variable PORT if defined, or default to 3000
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
