const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
  // Token'ı header'dan al
  const token = req.header('Authorization')?.split(' ')[1]; // "Bearer TOKEN" formatında

  // Token yoksa hata döndür
  if (!token) {
    return res.status(401).json({ 
      success:false,
      msg: 'No authentication token, access denied.' 
    });
  }

  try {
    // Token'ı doğrula ve payload'ı çöz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Kullanıcının varlığını kontrol et
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success:false,
        msg: 'User not found.' 
      });
    }

    next();
  } catch (err) {
    res.status(401).json({ 
      success:false,
      msg: 'Token Expired' 
    });
  }
};
