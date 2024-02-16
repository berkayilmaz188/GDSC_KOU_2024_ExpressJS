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
});

module.exports = mongoose.model('Advert', advertSchema);

