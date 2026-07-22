const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

/**
 * ========================================================
 * Cart Routes - /api/cart
 * ========================================================
 * سلة التسوق — تُخزَّن في الداتابيز مرتبطة بالمستخدم:
 *  - جلب السلة (GET /)
 *  - إضافة منتج (POST /)
 *  - تعديل كمية (PUT /:itemId)
 *  - حذف عنصر (DELETE /:itemId)
 *  - مسح الكل (DELETE /)
 * كل الـ routes محمية بالتوكن (protect)
 * ========================================================
 */

/**
 * @route   GET /api/cart
 * @desc    جلب سلة التسوق للمستخدم الحالي
 * @access  Private
 * @returns { cart: [{ _id, product: {name,price,image,category}, quantity, size, color }] }
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name price image category');

    res.json({ cart: user.cart || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/cart
 * @desc    إضافة منتج للسلة (أو زيادة الكمية لو موجود بنفس المقاس واللون)
 * @access  Private
 * @body    { productId, quantity?, size?, color? }
 * @returns { cart }
 */
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, size = '', color = '' } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'معرّف المنتج مطلوب' });
    }

    const user = await User.findById(req.user._id);

    // البحث عن نفس المنتج بنفس المقاس واللون
    const existingIndex = user.cart.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      // موجود → نزود الكمية
      user.cart[existingIndex].quantity += Number(quantity);
    } else {
      // مش موجود → نضيفه
      user.cart.push({ product: productId, quantity: Number(quantity), size, color });
    }

    await user.save();

    // نرجع السلة مع بيانات المنتجات
    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/cart/:itemId
 * @desc    تعديل كمية عنصر في السلة
 * @access  Private
 * @param   itemId - معرّف العنصر في السلة (subdocument _id)
 * @body    { quantity }
 * @returns { cart }
 */
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.cart.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود في السلة' });
    }

    item.quantity = Math.max(1, Number(quantity));
    await user.save();

    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    حذف عنصر معين من السلة
 * @access  Private
 * @param   itemId - معرّف العنصر في السلة
 */
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();

    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    مسح السلة بالكامل
 * @access  Private
 */
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ cart: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
