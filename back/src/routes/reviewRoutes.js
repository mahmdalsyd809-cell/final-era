const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

/**
 * ========================================================
 * Review Routes - /api/reviews
 * ========================================================
 * مسارات التعليقات العامة (بدون ربط بمنتج):
 *  - جلب جميع التعليقات (Public)
 *  - إضافة تعليق (مستخدم مسجل فقط)
 *  - تعديل تعليق (صاحب التعليق فقط)
 *  - حذف تعليق (صاحب التعليق أو الأدمن)
 *  - جلب ملخص التقييمات (Public)
 * ========================================================
 */

/**
 * @route   GET /api/reviews
 * @desc    جلب جميع التعليقات
 * @access  Public
 * @query   page  - رقم الصفحة (افتراضي 1)
 * @query   limit - عدد التعليقات في الصفحة (افتراضي 10)
 * @query   sort  - الترتيب: newest | oldest | highest | lowest
 * @returns { reviews, total, page, pages, avgRating, ratingBreakdown }
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'newest'
    } = req.query;

    // تحديد الترتيب
    let sortOption = { createdAt: -1 }; // الأحدث أولاً
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'highest') sortOption = { rating: -1 };
    else if (sort === 'lowest') sortOption = { rating: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // جلب التعليقات + العدد الكلي
    const [reviews, total] = await Promise.all([
      Review.find()
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name avatar'),
      Review.countDocuments()
    ]);

    // حساب توزيع النجوم (كم تعليق لكل نجمة)
    const ratingBreakdown = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // تحويل توزيع النجوم لشكل أسهل
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingBreakdown.forEach(r => {
      breakdown[r._id] = r.count;
    });

    // حساب المتوسط
    const avgRating = total > 0
      ? ratingBreakdown.reduce((sum, r) => sum + r._id * r.count, 0) / total
      : 0;

    res.json({
      reviews,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      avgRating: Math.round(avgRating * 10) / 10,
      ratingBreakdown: breakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    إضافة تعليق جديد
 * @access  Private (مستخدم مسجل)
 * @body    { rating, comment, title? }
 * @returns التعليق المُضاف
 */
router.post('/', protect, async (req, res) => {
  try {
    const { rating, comment, title } = req.body;

    // التحقق من أن المستخدم لم يعلق سابقاً
    const existingReview = await Review.findOne({ user: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        message: 'لقد قمت بكتابة تعليق سابقاً. يمكنك تعديل تعليقك.'
      });
    }

    // التحقق من البيانات
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'التقييم يجب أن يكون بين 1 و 5 نجوم' });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'نص التعليق مطلوب' });
    }

    // إنشاء التعليق
    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      title: title ? title.trim() : ''
    });

    // إرجاع التعليق مع بيانات المستخدم
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    // خطأ التعليق المكرر (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'لقد قمت بكتابة تعليق سابقاً.'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    تعديل تعليق (صاحب التعليق فقط)
 * @access  Private
 * @param   reviewId - معرّف التعليق
 * @body    { rating?, comment?, title? }
 * @returns التعليق المُحدَّث
 */
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'التعليق غير موجود' });
    }

    // التحقق من أن المستخدم هو صاحب التعليق
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا التعليق' });
    }

    // تحديث الحقول المُرسلة فقط
    if (req.body.rating) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ message: 'التقييم يجب أن يكون بين 1 و 5 نجوم' });
      }
      review.rating = Number(req.body.rating);
    }
    if (req.body.comment) review.comment = req.body.comment.trim();
    if (req.body.title !== undefined) review.title = req.body.title.trim();

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    حذف تعليق (صاحب التعليق أو الأدمن)
 * @access  Private
 * @param   reviewId - معرّف التعليق
 */
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'التعليق غير موجود' });
    }

    // صاحب التعليق أو الأدمن فقط
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا التعليق' });
    }

    await Review.findByIdAndDelete(review._id);

    res.json({ message: 'تم حذف التعليق بنجاح' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reviews/summary
 * @desc    جلب ملخص سريع للتقييمات
 * @access  Public
 * @returns { avgRating, numReviews, ratingBreakdown }
 */
router.get('/summary', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let totalRating = 0;

    stats.forEach(s => {
      breakdown[s._id] = s.count;
      totalReviews += s.count;
      totalRating += s._id * s.count;
    });

    res.json({
      avgRating: totalReviews > 0
        ? Math.round((totalRating / totalReviews) * 10) / 10
        : 0,
      numReviews: totalReviews,
      ratingBreakdown: breakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
