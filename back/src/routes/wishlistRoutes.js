const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

/**
 * ========================================================
 * Wishlist Routes - /api/wishlist
 * ========================================================
 * قائمة الأمنيات — تُخزَّن في الداتابيز مرتبطة بالمستخدم:
 *  - جلب القائمة (GET /)
 *  - إضافة/إزالة منتج (POST /toggle/:productId)
 *  - إزالة منتج (DELETE /:productId)
 *  - مسح الكل (DELETE /)
 * كل الـ routes محمية بالتوكن (protect)
 * ========================================================
 */

/**
 * @route   GET /api/wishlist
 * @desc    جلب قائمة الأمنيات للمستخدم الحالي
 * @access  Private (يحتاج توكن)
 * @returns { wishlist: [Product] }
 */
router.get('/', protect, async (req, res) => {
  try {
    // جلب المستخدم مع populate للمنتجات المفضلة
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price image category isNew isSale');

    res.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/wishlist/toggle/:productId
 * @desc    إضافة أو إزالة منتج من القائمة (Toggle)
 * @access  Private
 * @param   productId - معرّف المنتج
 * @returns { wishlist: [productIds], added: boolean }
 */
router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    // التحقق هل المنتج موجود بالفعل في القائمة
    const index = user.wishlist.indexOf(productId);
    let added = false;

    if (index > -1) {
      // المنتج موجود → نشيله
      user.wishlist.splice(index, 1);
    } else {
      // المنتج مش موجود → نضيفه
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    res.json({
      wishlist: user.wishlist,
      added
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    إزالة منتج معين من القائمة
 * @access  Private
 * @param   productId - معرّف المنتج
 */
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/wishlist
 * @desc    مسح قائمة الأمنيات بالكامل
 * @access  Private
 */
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();

    res.json({ wishlist: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
