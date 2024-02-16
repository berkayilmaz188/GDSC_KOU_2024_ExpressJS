const express = require('express');
const router = express.Router();
const { addCategory, listCategories, deleteCategory } = require('../controllers/categoriesController');

// Kategori ekleme endpoint'i
router.post('/', addCategory);

// Kategorileri listeleme endpoint'i
router.get('/', listCategories);

// Kategori silme endpoint'i
router.delete('/:id', deleteCategory);

module.exports = router;

