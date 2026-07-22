const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * ========================================================
 * Product Routes - /api/products
 * ========================================================
 * مسارات عامة للمنتجات (Public) - لا تحتاج توثيق
 * ملاحظة: للإدارة استخدم /api/admin/products
 * ========================================================
 */

/**
 * @route   GET /api/products
 * @desc    جلب جميع المنتجات مع الفلترة والبحث
 * @access  Public
 * @query   category  - فلترة حسب الفئة
 * @query   q         - بحث بالاسم
 * @query   priceMin  - أقل سعر
 * @query   priceMax  - أعلى سعر
 * @query   sort      - الترتيب: newest | price_asc | price_desc | rating
 * @query   inStock   - true/false
 * @returns قائمة المنتجات
 */
router.get('/', async (req, res) => {
  try {
    const { category, q, priceMin, priceMax, sort, inStock } = req.query;
    const filter = {};

    if (category) filter.category = category.toLowerCase();
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (inStock === 'true') filter.inStock = true;
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    جلب تفاصيل منتج واحد
 * @access  Public
 * @param   id - معرّف المنتج
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;