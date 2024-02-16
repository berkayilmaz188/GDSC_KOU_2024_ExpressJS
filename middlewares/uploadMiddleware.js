const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, '../photos');
fs.mkdirSync(photosDir, { recursive: true }); // photos dizini yoksa oluştur

const storage = multer.memoryStorage(); // Resimleri bellekte tutmak için
const upload = multer({ storage: storage });

module.exports = { upload };
// Resim işleme ve kaydetme middleware'i
/*
const resizeAndFormatImage = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = []; // Resim URL'lerini saklamak için
  await Promise.all(
    req.files.map(async (file) => {
      const newFilename = `${Date.now()}-${file.originalname.split('.')[0]}.jpeg`;
      const outputPath = path.join(photosDir, newFilename);

      await sharp(file.buffer)
        .resize(800) // Genişliği 800px yap
        .toFormat('jpeg')
        .toFile(outputPath);

      req.body.images.push(outputPath);
    })
  );

  next();
}; */


