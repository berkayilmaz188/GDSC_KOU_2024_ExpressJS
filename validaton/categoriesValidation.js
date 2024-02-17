// models/categoriesModel.js dosyanızdan Categories modelini import edin
const Categories = require('../models/categoriesModel');

const validateCategoryAndTag = async (category, tag) => {
  const categoryExists = await Categories.findOne({ category, tag });
  return !!categoryExists;
};


module.exports = validateCategoryAndTag;

