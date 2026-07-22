const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * ========================================================
 * موديل المستخدم (User Model)
 * ========================================================
 * يُخزَّن هنا كل بيانات المستخدم:
 *  - بيانات أساسية: الاسم، الإيميل، كلمة المرور
 *  - isAdmin: هل هو مدير؟
 *  - العنوان ورقم الهاتف
 *  - حالة الحساب (isActive)
 * ========================================================
 */

const userSchema = new mongoose.Schema(
  {
    // ── بيانات أساسية ──────────────────────────────────
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'الإيميل مطلوب'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: 6
    },

    // ── الصلاحيات ──────────────────────────────────────
    // true = مدير النظام (Admin)، false = مستخدم عادي
    isAdmin: {
      type: Boolean,
      default: false
    },

    // ── بيانات التواصل والشحن ──────────────────────────
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },

    // ── حالة الحساب ────────────────────────────────────
    // true = الحساب مفعّل، false = محظور أو غير مفعّل
    isActive: {
      type: Boolean,
      default: true
    },

    // ── صورة الملف الشخصي ──────────────────────────────
    avatar: {
      type: String,
      default: ''
    },

    // ── قائمة الأمنيات (Wishlist) ───────────────────────
    // مصفوفة بمعرّفات المنتجات المفضلة — تُخزَّن في الداتابيز مش localStorage
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // ── سلة التسوق (Cart) ──────────────────────────────
    // كل عنصر فيه: المنتج + الكمية + المقاس + اللون
    cart: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1, min: 1 },
      size: { type: String, default: '' },
      color: { type: String, default: '' }
    }]
  },
  {
    // يضيف createdAt و updatedAt تلقائياً
    timestamps: true
  }
);

/**
 * دالة مقارنة كلمة المرور
 * الاستخدام: await user.matchPassword('كلمة المرور المدخلة')
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Hook: قبل الحفظ - تشفير كلمة المرور إذا تم تعديلها
 */
userSchema.pre('save', async function (next) {
  // فقط نشفر إذا تغيرت كلمة المرور
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
