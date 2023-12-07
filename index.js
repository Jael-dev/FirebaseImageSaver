
const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
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
    res.status(500).send('Internal Server Error');
  }
});

exports.uploadImage = functions.https.onRequest(app);
