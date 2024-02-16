const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware'); // Doğru yolu kullanın
const { addAdvert, deleteAdvert, getAdvert, getAllPublicAdverts } = require('../controllers/advertController');
const auth = require('../middlewares/authMiddleware');
// İlan ekleme ve resim yükleme endpoint'i

router.post('/create', auth, upload.array('images', 5), addAdvert);
router.get('/getAdvert', auth, getAdvert);
router.delete('/:id', auth, deleteAdvert);
router.get('/allAdverts', getAllPublicAdverts);


module.exports = router;
