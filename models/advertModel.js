const mongoose = require('mongoose');

const advertSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tag: { type: String, required: true }, 
  city: { type: String, required: true }, 
  createTime: { type: Date, default: Date.now },
  deadTime: { type: Date, required: true },
  point: { type: Number, required: true },
  status: { type: String, default: 'active' }, // 'active', 'inactive' gibi durumlar olabilir
  visibility: { type: String, default: 'public' }, // 'public' veya 'private'
  images: [String], // Resimlerin URL'lerini saklayacak
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lostParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Kazanan kullanıcının ID'si
  minParticipants: { type: Number, required: true }, // Minimum katılımcı sayısı
  drawCompleted: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Advert', advertSchema);

