const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware'); // Doğru yolu kullanın
const { addAdvert, deleteAdvert, getAdvert, getAllPublicAdverts, getPublicAdvertsByCity, getFilteredAdverts, viewPublicAdvert, updateAdvert, getUserAdvertDetails, getUserActionsHistory, getPrivateAdvertDetails, addFavoriteAdvert, getFavoriteAdverts, removeFavoriteAdvert } = require('../controllers/advertController');
const auth = require('../middlewares/authMiddleware');
const { joinAdvert, performDraw, withdrawFromAdvert, getAdvertDetails } = require('../controllers/advertJoinController');
const validateRequest = require('../middlewares/validateRequest');
const { updateAdvertValidation } = require('../validaton/advertValidation');
// İlan ekleme ve resim yükleme endpoint'i

router.post('/create', auth, upload.array('images', 5), addAdvert); //İlan Olusturur
router.put('/update/:id', auth, validateRequest(updateAdvertValidation), updateAdvert); // İd deki ilanı update eder.


router.get('/getAdvert', auth, getAdvert); // Private kullanıcının tüm ilanlarını listeler
router.delete('/:id', auth, deleteAdvert); // Id' deki ilanı siler


router.get('/filteredAdverts', auth, getFilteredAdverts); // Public Parametresiz Kullanıcının Şehrindeki Tüm İlanları Döner ?category=Electronics ?tag=Headphones ?category=Electronics&tag=Headphones

//Çekiliş Sistemi
router.post('/join/:advertId', auth, joinAdvert); // Private Id Deki İlana Çekilişe Katılmaya Yarar
router.post('/performDraw/:advertId', auth, performDraw); // Private Min Sayı Erişildiyse Çekilişi Düzenler
router.delete('/withdraw/:advertId', auth, withdrawFromAdvert); // Private Id'deki İlandan Çekilir.


router.get('/advertDetails/:advertId', auth, getPrivateAdvertDetails); //Private İlanların Durumu Hakkında Detaylı Bilgi Döner
router.get('/viewPublicAdvert/:advertId', auth, viewPublicAdvert); // Public O İlanın Detaylı Bilgilerini Döner

router.get('/advertStatus/:type', auth, getUserAdvertDetails);  //Private parametre olarak participatedAdverts lostAdverts wonAdverts deki ilanların bilgilerini detaylı çeker.
router.get('/actionsHistory/:limit', auth, getUserActionsHistory); //Private Parametre'de alınan adet kadar kullanıcının yaptığı geçmiş olayları ilan detayı ile beraber döner

router.post('/favoriteAdverts/:advertId', auth, addFavoriteAdvert); //Private  Id'deki ilanı favoriye ekler
router.get('/favoriteAdverts/:limit', auth, getFavoriteAdverts); // Private adet kadar kullanıcının favorilerini döner
router.delete('/favoriteAdverts/:advertId', auth, removeFavoriteAdvert);// Private Id deki ilanı favorilerim listesinden kaldırır

//Gereksiz Endpointler
router.get('/publicAdverts/:city', auth, getPublicAdvertsByCity);
router.get('/allAdverts', getAllPublicAdverts); // Public Tüm ilanları döner
module.exports = router;
