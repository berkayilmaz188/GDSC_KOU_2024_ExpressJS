const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const { sendActivationEmail , sendPasswordResetEmail } = require('../helpers/mailer');



exports.register = async (req, res) => {
  try {
    const { email, password, username, name, surname, phoneNumber, city, location, longitude, latitude } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
    if (user) {
      return res.status(400).json({ success: false, msg: 'The email, username or phone number is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    user = new User({
      email,
      password: hashedPassword,
      username,
      name,
      surname,
      phoneNumber,
      city,
      location,
      longitude,
      latitude,
      isVerified: false // Kullanıcı ilk oluşturulduğunda doğrulanmamış olacak
    });

    await user.save();
    // Kullanıcı için bir aktivasyon token'i oluştur
    const activationToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '1h' });

    // Aktivasyon e-postasını gönder
    await sendActivationEmail(user.email, activationToken);

    res.status(201).json({ msg: 'Kullanıcı başarıyla oluşturuldu. Lütfen e-posta adresinizi doğrulayın.' });
  } catch (err) {
    res.status(500).json({ msg: 'Sunucu hatası', error: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.params;
  if (token) {
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);
      const { user } = decoded;

      // Kullanıcının isVerified alanını güncelle
      await User.findByIdAndUpdate(user.id, { isVerified: true });

      return res.status(200).json({ message: 'Hesap başarıyla aktive edildi.' });
    } catch (error) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş aktivasyon linki.' });
    }
  } else {
    return res.status(400).json({ error: 'Aktivasyon için token gereklidir.' });
  }
};

exports.resendActivationEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Bu hesap zaten aktive edilmiş.' });
  }

  // Kullanıcı için yeni bir aktivasyon token'i oluştur
  const activationToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '1h' });

  // Aktivasyon e-postasını tekrar gönder
  await sendActivationEmail(user.email, activationToken);

  res.status(200).json({ message: 'Aktivasyon e-postası başarıyla gönderildi.' });
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'E-posta adresi ile ilişkili bir kullanıcı bulunamadı.' });
  }

  // Şifre sıfırlama token'ı oluştur ve kullanıcı modeline kaydet
  const resetToken = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordExpire = Date.now() + 3600000; // 1 saat sonrası için süre

  await user.save();

  const resetUrl = `http://app.welfare.ws/api/v1/auth/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    res.status(200).json({ message: 'E-posta adresinize şifre sıfırlama linki gönderildi.' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu.' });
  }
};


exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Şifre sıfırlama tokenı geçersiz veya süresi dolmuş.' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.', error: error.message });
  }
};


// Kullanıcı Girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Incorrect password.' });
    }

    const payload = {
      user: {
        id: user.id,
        city: user.city
      }
    };

    // Kullanıcı bilgilerini bir değişkene atayın ve şifreyi çıkarın
    const userForResponse = user.toObject();
    delete userForResponse.password; // Şifreyi yanıttan çıkarın

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      // Token ile birlikte kullanıcı bilgilerini de döndürün
      res.json({ success: true, token, user: userForResponse });
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { email, name, surname, phoneNumber, username } = req.body;
  let updateFields = {};

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found.' });
    }

    // Kullanıcı mevcut değerlerini güncellemeye çalışmıyorsa benzersizlik kontrolü yap
    if (email && email !== user.email && await User.findOne({ email })) {
      return res.status(400).json({ success: false, msg: 'Email already in use.' });
    }
    if (username && username !== user.username && await User.findOne({ username })) {
      return res.status(400).json({ success: false, msg: 'Username already in use.' });
    }
    if (phoneNumber && phoneNumber !== user.phoneNumber && await User.findOne({ phoneNumber })) {
      return res.status(400).json({ success: false, msg: 'Phone number already in use.' });
    }

    // Güncellenecek alanları belirle
    if (email) updateFields.email = email;
    if (name) updateFields.name = name;
    if (surname) updateFields.surname = surname;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (username) updateFields.username = username;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select('-password -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({ success: true, msg: 'User updated successfully.', user: updatedUser.toObject({ getters: true }) });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Eski şifrenin doğruluğunu kontrol et
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'The old password is incorrect.' });
    }

    // Yeni şifreyi hash'le ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.userLocationUpdate = async (req, res) => {
  const { city, location, longitude, latitude } = req.body;
  let updateFields = {};

  // Sadece dolu olan alanları güncelleme nesnesine ekle
  if (city) updateFields.city = city;
  if (location) updateFields.location = location;
  if (longitude) updateFields.longitude = longitude;
  if (latitude) updateFields.latitude = latitude;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true, select: '-password -resetPasswordToken -resetPasswordExpire -isVerified -email -name -surname -phoneNumber ' });

    res.status(200).json({ success: true, message: 'User location updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



