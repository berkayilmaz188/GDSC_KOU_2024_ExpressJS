const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware'); // Doğru yolu kullanın
const { addAdvert, deleteAdvert, getAdvert, getAllPublicAdverts, getPublicAdvertsByCity, getFilteredAdverts, viewPublicAdvert, updateAdvert, getUserAdvertDetails, getUserActionsHistory, getPrivateAdvertDetails } = require('../controllers/advertController');
const auth = require('../middlewares/authMiddleware');
const { joinAdvert, performDraw, withdrawFromAdvert, getAdvertDetails } = require('../controllers/advertJoinController');
const validateRequest = require('../middlewares/validateRequest');
const { updateAdvertValidation } = require('../validaton/advertValidation');
// İlan ekleme ve resim yükleme endpoint'i

router.post('/create', auth, upload.array('images', 5), addAdvert);
router.put('/update/:id', auth, validateRequest(updateAdvertValidation), updateAdvert);


router.get('/getAdvert', auth, getAdvert);
router.delete('/:id', auth, deleteAdvert);
router.get('/publicAdverts/:city', auth, getPublicAdvertsByCity);
router.get('/filteredAdverts', auth, getFilteredAdverts);
router.get('/allAdverts', getAllPublicAdverts);

router.post('/join/:advertId', auth, joinAdvert);
router.post('/performDraw/:advertId', auth, performDraw);
router.delete('/withdraw/:advertId', auth, withdrawFromAdvert);


router.get('/advertDetails/:advertId', auth, getPrivateAdvertDetails);
router.get('/viewPublicAdvert/:advertId', auth, viewPublicAdvert);

router.get('/advertStatus/:type', auth, getUserAdvertDetails);
router.get('/actionsHistory/:limit', auth, getUserActionsHistory);


module.exports = router;
