const express = require('express');
const router = express.Router();
const { register, login , activateAccount , resendActivationEmail, forgotPassword , resetPassword} = require('../controllers/userController');
const { registerValidation, loginValidation , resendActivationEmailValidation , forgotPasswordValidation , resetPasswordValidation} = require('../validaton/authValidation');
const validateRequest = require('../middlewares/validateRequest');

// Kullanıcı Kaydı Route
router.post('/register', validateRequest(registerValidation), register);

// Kullanıcı Girişi Route
router.post('/login', validateRequest(loginValidation), login);

router.get('/activate/:token', activateAccount);
router.post('/resend-activation', validateRequest(resendActivationEmailValidation), resendActivationEmail);

// Şifre sıfırlama için e-posta gönderme endpoint'i
router.post('/forgot-password', validateRequest(forgotPasswordValidation), forgotPassword);

// Şifre sıfırlama linki ile yeni şifre belirleme endpoint'i
router.post('/reset-password/:resetToken', validateRequest(resetPasswordValidation), resetPassword);

module.exports = router;
