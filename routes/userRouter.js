const express = require('express');
const router = express.Router();
const { updateUser, userLocationUpdate, updatePassword} = require('../controllers/userController');
const validateRequest = require('../middlewares/validateRequest');
const { updateUserValidation, userLocationUpdateValidation, updatePasswordValidation } = require('../validaton/userValidation');
const auth = require('../middlewares/authMiddleware');

// Kullanıcı güncelleme route'u
router.put('/update/profile', validateRequest(updateUserValidation), auth, updateUser);
router.put('/update/password', auth, validateRequest(updatePasswordValidation), updatePassword);
router.put('/update/location', validateRequest(userLocationUpdateValidation), auth, userLocationUpdate);
module.exports = router;
