const mongoose = require('mongoose');

/**
 * ========================================================
 * موديل المنتج (Product Model)
 * ========================================================
 * يُخزَّن هنا كل تفاصيل منتج الملابس:
 *  - الاسم، الوصف، السعر، الفئة
 *  - المقاسات والألوان المتاحة
 *  - الصورة الرئيسية + معرض صور إضافي
 *  - عدد المخزون (stock)
 *  - التقييم ومتوسطه
 *  - علامة "جديد" أو "على البيع"
 * ========================================================
 */

const productSchema = new mongoose.Schema(
  {
    // ── معلومات أساسية ──────────────────────────────────
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً']
    },
    // السعر قبل الخصم (إن وُجد)
    originalPrice: {
      type: Number,
      default: null
    },

    // ── التصنيف ────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'الفئة مطلوبة'],
      trim: true,
      lowercase: true
    },
    // تصنيف فرعي (مثلاً: coats, shirts, pants)
    subcategory: {
      type: String,
      default: ''
    },

    // ── الصور ──────────────────────────────────────────
    // الصورة الرئيسية للمنتج
    image: {
      type: String,
      default: ''
    },
    // معرض صور إضافي للمنتج (يظهر في صفحة التفاصيل)
    images: {
      type: [String],
      default: []
    },

    // ── المقاسات والألوان ──────────────────────────────
    // المقاسات المتاحة: XS, S, M, L, XL, XXL
    sizes: {
      type: [String],
      default: []
    },
    // الألوان المتاحة (قيم هيكس أو أسماء)
    colors: {
      type: [String],
      default: []
    },

    // ── المخزون ────────────────────────────────────────
    // هل المنتج متاح أم لا
    inStock: {
      type: Boolean,
      default: true
    },
    // عدد القطع المتبقية في المخزون
    stockCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // ── التقييم ────────────────────────────────────────
    // متوسط التقييمات (1-5)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    // عدد التقييمات الكلي
    numReviews: {
      type: Number,
      default: 0
    },

    // ── علامات مميزة ───────────────────────────────────
    // هل هو منتج جديد؟ (NEW badge)
    isNew: {
      type: Boolean,
      default: false
    },
    // هل هو معروض للبيع؟ (SALE badge)
    isSale: {
      type: Boolean,
      default: false
    },
    // هل هو مميز في الصفحة الرئيسية؟
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    // يضيف createdAt و updatedAt تلقائياً
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

// ── Index للبحث السريع ────────────────────────────────
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);