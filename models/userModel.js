const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },  
  location: { type: String, required: true },
  longitude: { type: String, required: true },
  latitude: { type: String, required: true },
  isVerified: { type: Boolean, default:false , required: true },
  resetPasswordToken: String, // Şifre sıfırlama token'ı için alan
  resetPasswordExpire: Date // Token'ın geçerlilik süresi için alan
});

module.exports = mongoose.model('User', userSchema);
