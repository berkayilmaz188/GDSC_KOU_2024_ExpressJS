const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // İşlem tipi (örn: "advertAdded", "joinedAdvert", "wonAdvert")
  advertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advert', required: false }, // İlgili ilanın ID'si
  timestamp: { type: Date, default: Date.now } // İşlem zamanı
}, { _id: false }); // Bu alt dökümanın kendi ID'si olmaması için

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  city: { type: String, required: true },  
  location: { type: String, required: true },
  longitude: { type: String, required: true },
  latitude: { type: String, required: true },
  isVerified: { type: Boolean, default:false , required: true },
  actionsHistory: [actionSchema],
  participatedAdverts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advert' }],
  wonAdverts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advert' }],
  points: { type: Number, required: true, default: 200 },
  resetPasswordToken: String, // Şifre sıfırlama token'ı için alan
  resetPasswordExpire: Date // Token'ın geçerlilik süresi için alan
  
});

module.exports = mongoose.model('User', userSchema);
