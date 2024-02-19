const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
  category: { type: String, required: true },
  tag: { type: String, required: true }, // Birden fazla etiket içerebilir
  point: { type: Number, required: true },
  minParticipants: { type: Number, required: true }, // Birden fazla etiket içerebilir
});

module.exports = mongoose.model('Categories', categoriesSchema);

