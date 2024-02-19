const fs = require('fs');
const path = require('path');
const Advert = require('../models/advertModel'); // Modelin yolu projenize göre değişiklik gösterebilir
const photosDir = path.join(__dirname, '../photos');
const sharp = require('sharp');
const validateCategoryAndTag = require('../validaton/categoriesValidation');
const Categories = require('../models/categoriesModel');
const User = require('../models/userModel');
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

exports.updateAdvert = async (req, res) => {
  const { id } = req.params;
  const { category, tag, point, minParticipants, ...otherFields } = req.body;
  let updateFields = {};

  // Sadece dolu olan alanları güncelleme nesnesine ekle
  Object.keys(otherFields).forEach(key => {
    if (otherFields[key]) updateFields[key] = otherFields[key];
  });

  // Kategori, etiket, puan ve minimum katılımcı sayısının kontrolü
  const isValid = await validateCategoryTagPointAndMinParticipants(category, tag, point, minParticipants);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid category, tag, point, or minParticipants. Please check your data."
    });
  }

  try {
    const advert = await Advert.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    res.status(200).json({ success: true, advert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating the advert", error: error.message });
  }
};

async function validateCategoryTagPointAndMinParticipants(category, tag, point, minParticipants) {
  if (!category || !tag) return true; // Kategori ve etiket kontrolü isteğe bağlıdır
  // String olarak gelen point ve minParticipants değerlerini Number tipine dönüştür
  const numericPoint = Number(point);
  const numericMinParticipants = Number(minParticipants);

  const categoryData = await Categories.findOne({ category, tag });
  return categoryData && categoryData.point === numericPoint && categoryData.minParticipants === numericMinParticipants;
}


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

exports.viewPublicAdvert = async (req, res) => {
  const { advertId } = req.params; // Path'dan alınan ilan ID'si

  try {
      const advert = await Advert.findById(advertId)
                                 .populate('owner', 'username email') // İlan sahibinin bazı bilgilerini getir
                                 .populate('participants', 'username'); // Katılımcı bilgilerini getir

      if (!advert) {
          return res.status(404).json({ success: false, message: "Advert not found." });
      }

      // Eğer ilan public değilse veya status 'active' değilse ve kullanıcı ilan sahibi değilse, erişimi reddet
      if ((advert.visibility !== 'public' || advert.status !== 'active') && advert.owner._id.toString() !== req.user.id.toString()) {
          return res.status(403).json({ success: false, message: "Access denied." });
      }

      const participantCount = advert.participants.length;

      // İlan detaylarını döndür
      res.status(200).json({
          success: true,
          advert: {
              title: advert.title,
              description: advert.description,
              category: advert.category,
              tag: advert.tag,
              city: advert.city,
              status: advert.status,
              visibility: advert.visibility,
              participantCount: participantCount,
              images: advert.images.map(image => `${req.protocol}://${req.get('host')}/photos/${image}`) // Resimlerin tam URL'lerini döndür
              //participants: advert.participants
              // Katılımcı bilgileri
          }
      });
  } catch (error) {
      console.error("Error viewing public advert:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getUserAdvertDetails = async (req, res) => {
  const { type } = req.params; // URL'den eylem tipini al (lostAdverts, wonAdverts, participatedAdverts)
  const userId = req.user.id; // Auth middleware'inden gelen kullanıcı ID'si

  try {
      const user = await User.findById(userId).populate({
          path: type, // Dinamik olarak populate edilecek yol (lostAdverts, wonAdverts, participatedAdverts)
          select: 'title description category tag city status visibility images' // İlan detaylarını seç
      });

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      // Belirtilen tipdeki ilanlar yoksa veya boşsa
      if (!user[type] || user[type].length === 0) {
          return res.status(404).json({ success: false, message: `No adverts found for ${type}.` });
      }

      // İlanların detaylarını döndür
      res.status(200).json({
          success: true,
          adverts: user[type] // Dinamik olarak ilanların detaylarını döndür
      });
  } catch (error) {
      console.error(`Error retrieving ${type} adverts details:`, error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getUserActionsHistory = async (req, res) => {
  const userId = req.user.id; // Auth middleware'inden gelen kullanıcı ID'si
  const limit = parseInt(req.params.limit); // URL'den limit parametresini al

  try {
    const user = await User.findById(userId, 'actionsHistory')
      .populate({
        path: 'actionsHistory.advertId',
        select: 'title description category tag city status visibility images' // İlan detaylarını seç
      })
      .exec();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Kullanıcının eylem geçmişinden istenen sayıda son kaydı seç
    const actionsWithDetails = user.actionsHistory.slice(-limit).map(action => {
      return {
        type: action.type,
        advertId: action.advertId, // advertDetails yerine doğrudan burada advertId detaylarını ver
        timestamp: action.timestamp
      };
    });

    res.status(200).json({
      success: true,
      actionsHistory: actionsWithDetails
    });
  } catch (error) {
    console.error("Error retrieving actions history details:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



