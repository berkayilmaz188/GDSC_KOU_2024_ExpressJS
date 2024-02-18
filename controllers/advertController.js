const fs = require('fs');
const path = require('path');
const Advert = require('../models/advertModel'); // Modelin yolu projenize göre değişiklik gösterebilir
const photosDir = path.join(__dirname, '../photos');
const sharp = require('sharp');
const validateCategoryAndTag = require('../validaton/categoriesValidation');

exports.addAdvert = async (req, res) => {
  let savedAdvert;

  try {
    const { title, description, category, tag, city, deadTime, point, status, visibility , minParticipants} = req.body;

    // Kategori ve etiketin geçerliliğini kontrol et
    const isValidCategoryAndTag = await validateCategoryAndTag(category, tag);
    if (!isValidCategoryAndTag) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or tag. Please add the category and tag first."
      });
    }

    savedAdvert = new Advert({
      owner: req.user.id,
      title,
      description,
      category,
      tag,
      city,
      createTime: Date.now(),
      deadTime,
      point,
      status,
      visibility,
      minParticipants,
      images: []
    });

    savedAdvert = await savedAdvert.save();

    let failedImages = []; // Başarısız resim işlemlerini takip etmek için

    if (req.files) {
      const imageUploadPromises = req.files.map(async (file, index) => {
        try {
          const newFilename = `${savedAdvert._id}-${Date.now()}-${index}.jpeg`;
          const outputPath = path.join(photosDir, newFilename);

          await sharp(file.buffer)
            .resize(800)
            .toFormat('jpeg')
            .toFile(outputPath);

          return `${req.protocol}://${req.get('host')}/photos/${newFilename}`;
        } catch (error) {
          console.error("Resim işlenirken hata oluştu:", error);
          failedImages.push(file.originalname); // Başarısız olan resmin adını kaydet
          return null;
        }
      });

      const imageResults = await Promise.all(imageUploadPromises);
      savedAdvert.images = imageResults.filter(result => result !== null); // Hata olmayanları filtrele
      await savedAdvert.save();

      // Eğer başarısız resim işlemleri varsa, bu bilgiyi yanıtta döndür
      if (failedImages.length > 0) {
        return res.status(400).json({
          message: "İlan başarıyla eklendi, ancak bazı resimler işlenemedi.",
          failedImages: failedImages,
          advert: savedAdvert
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "The ad has been added successfully.",
      advert: savedAdvert
    });
  } catch (error) {
    console.error("İlan eklenirken bir hata oluştu:", error);
    // İlan eklenirken bir hata oluştuğunda, önceden eklenen resimleri temizle
    if (savedAdvert && savedAdvert.images) {
      savedAdvert.images.forEach(imageUrl => {
        const imagePath = path.join(photosDir, imageUrl.split('/photos/')[1]);
        fs.unlink(imagePath, err => {
          if (err) console.error("Resim silinirken bir hata oluştu:", err);
        });
      });
    }
    res.status(500).json({ message: "İlan eklenirken bir hata oluştu.", error: error.message });
  }
};


exports.getAdvert = async (req, res) => {
  try {
    const adverts = await Advert.find({ owner: req.user.id });

    if (!adverts.length) {
      return res.status(404).json({
        success: false,
        message: "No adverts found."
      });
    }

    const updatedAdverts = adverts.map(advert => {
      advert.images = advert.images.map(image => {
        return `${image}`;
      });
      return advert;
    });

    res.status(200).json({
      success: true,
      adverts: updatedAdverts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving adverts.",
      error: error.message
    });
  }
};


exports.deleteAdvert = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);

    if (!advert) {
      return res.status(404).json({
        success: false,
        message:
          "Advertisement not found."
      });
    }

    if (advert.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action."
      });
    }

    // İlanın resimlerini sil
    advert.images.forEach(imageUrl => {
      // URL'nin son kısmını almak için '/' ile ayırıp son elemanı alın
      const filename = imageUrl.split('/').pop();
      const fullPath = path.join(photosDir, filename);
      fs.unlink(fullPath, err => {
        if (err) console.error("An error occurred while deleting the image:", err);
      });
    });

    // İlanı veritabanından sil
    await Advert.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "The ad and related images have been successfully deleted."
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while deleting the ad.", error: error.message });
  }
};


exports.getAllPublicAdverts = async (req, res) => {
  try {
    const adverts = await Advert.find({ status: 'active', visibility: 'public' }).populate('owner', 'username');

    const updatedAdverts = adverts.map(advert => ({
      ...advert._doc,
      images: advert.images.map(image => `${image}`)
    }));

    res.status(200).json({
      success: true,
      adverts: updatedAdverts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving all public adverts.",
      error: error.message
    });
  }
};

exports.getPublicAdvertsByCity = async (req, res) => {
  const requestedCity = req.params.city;
  const userCity = req.user.city; // JWT middleware'inden gelen şehir bilgisini alın

  if (requestedCity !== userCity) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access adverts in your city."
    });
  }

  try {
    const adverts = await Advert.find({ status: 'active', visibility: 'public', city: requestedCity }).populate('owner', 'username');

    const updatedAdverts = adverts.map(advert => ({
      ...advert._doc,
      images: advert.images.map(image => `${image}`)
    }));

    res.status(200).json({
      success: true,
      adverts: updatedAdverts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving public adverts for the specified city.",
      error: error.message
    });
  }
};

exports.getFilteredAdverts = async (req, res) => {
  const { category, tag } = req.query; // Query'den category ve tag bilgilerini al
  const city = req.user.city; // JWT'den şehir bilgisini al

  // Filtreleme için bir MongoDB sorgu nesnesi oluştur
  let query = {
    status: 'active',
    visibility: 'public',
    city: city
  };

  // Category ve tag bilgileri varsa sorguya ekle
  if (category) query.category = category;
  if (tag) query.tag = tag;

  try {
    const adverts = await Advert.find(query).populate('owner', 'username');

    const updatedAdverts = adverts.map(advert => ({
      ...advert._doc,
      images: advert.images.map(image => `${image}`)
    }));

    res.status(200).json({
      success: true,
      adverts: updatedAdverts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving filtered adverts.",
      error: error.message
    });
  }
};



