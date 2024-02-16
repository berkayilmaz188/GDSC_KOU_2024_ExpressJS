const Categories = require('../models/categoriesModel');

exports.addCategory = async (req, res) => {
  const { category, tag } = req.body;

  try {
    const newCategory = new Categories({ category, tag });
    await newCategory.save();
    res.status(201).json({ success: true, message: 'Category added successfully.', data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while adding the category.', error: error.message });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const categories = await Categories.find({});
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while retrieving categories.', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Categories.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while deleting the category.', error: error.message });
  }
};
