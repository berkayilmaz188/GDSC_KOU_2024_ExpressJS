const express = require('express');
const router = express.Router();
const { updateUser, userLocationUpdate} = require('../controllers/userController');
const validateRequest = require('../middlewares/validateRequest');
const { updateUserValidation, userLocationUpdateValidation } = require('../validaton/userValidation');
const auth = require('../middlewares/authMiddleware');

// Kullanıcı güncelleme route'u
router.put('/update/profile', validateRequest(updateUserValidation), auth, updateUser);
router.put('/update/location', validateRequest(userLocationUpdateValidation), auth, userLocationUpdate);
module.exports = router;
