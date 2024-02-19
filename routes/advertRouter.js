const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware'); // Doğru yolu kullanın
const { addAdvert, deleteAdvert, getAdvert, getAllPublicAdverts, getPublicAdvertsByCity, getFilteredAdverts, viewPublicAdvert } = require('../controllers/advertController');
const auth = require('../middlewares/authMiddleware');
const { joinAdvert, performDraw, withdrawFromAdvert, getAdvertDetails } = require('../controllers/advertJoinController');
// İlan ekleme ve resim yükleme endpoint'i

router.post('/create', auth, upload.array('images', 5), addAdvert);
router.get('/getAdvert', auth, getAdvert);
router.delete('/:id', auth, deleteAdvert);
router.get('/publicAdverts/:city', auth, getPublicAdvertsByCity);
router.get('/filteredAdverts', auth, getFilteredAdverts);
router.get('/allAdverts', getAllPublicAdverts);

router.post('/join/:advertId', auth, joinAdvert);
router.post('/performDraw/:advertId', auth, performDraw);
router.delete('/withdraw/:advertId', auth, withdrawFromAdvert);
router.get('/advertDetails/:advertId', auth, getAdvertDetails);

router.get('/viewPublicAdvert/:advertId', auth, viewPublicAdvert);
module.exports = router;
