const mongoose = require('mongoose');

/**
 * ========================================================
 * موديل الطلب (Order Model)
 * ========================================================
 * يُخزَّن هنا كل تفاصيل الطلب:
 *  - بيانات العميل (الاسم، الإيميل، الهاتف، العنوان)
 *  - قائمة المنتجات المطلوبة (items)
 *  - إجمالي المبلغ وتكلفة الشحن
 *  - حالة الطلب (pending → processing → shipped → delivered)
 *  - طريقة الدفع
 *  - ربط اختياري بمستخدم مسجّل
 * ========================================================
 */

// ── مخطط عنصر واحد داخل الطلب ──────────────────────────
const orderItemSchema = new mongoose.Schema({
  // مرجع للمنتج في مجموعة Products
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // اسم المنتج (محفوظ هنا لو المنتج اتحذف لاحقاً)
  productName: {
    type: String,
    default: ''
  },
  // صورة المنتج (محفوظة هنا للعرض السريع)
  productImage: {
    type: String,
    default: ''
  },
  // الكمية المطلوبة
  quantity: {
    type: Number,
    required: true,
    min: [1, 'الكمية يجب أن تكون 1 على الأقل']
  },
  // المقاس المختار
  size: {
    type: String,
    default: ''
  },
  // اللون المختار
  color: {
    type: String,
    default: ''
  },
  // السعر وقت الطلب (قد يختلف لاحقاً)
  price: {
    type: Number,
    required: true
  }
});

// ── مخطط الطلب الرئيسي ──────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── ربط بمستخدم مسجّل (اختياري - للضيوف يكون null) ─
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ── بيانات العميل ──────────────────────────────────
    customer: {
      name: { type: String, required: [true, 'اسم العميل مطلوب'] },
      email: { type: String, required: [true, 'إيميل العميل مطلوب'] },
      phone: { type: String, default: '' },
      address: { type: String, default: '' }
    },

    // ── المنتجات المطلوبة ──────────────────────────────
    items: {
      type: [orderItemSchema],
      required: true
    },

    // ── المبالغ ────────────────────────────────────────
    // سعر المنتجات فقط (بدون شحن)
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    // تكلفة الشحن
    shippingCost: {
      type: Number,
      default: 0
    },
    // المبلغ الكلي (subtotal + shippingCost)
    totalAmount: {
      type: Number,
      required: true
    },

    // ── حالة الطلب ─────────────────────────────────────
    // pending: منتظر التأكيد
    // processing: قيد المعالجة
    // shipped: تم الشحن
    // delivered: تم التسليم
    // cancelled: ملغي
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },

    // ── طريقة الدفع ────────────────────────────────────
    // cod = Cash on Delivery (الدفع عند الاستلام)
    // card = بطاقة ائتمانية
    paymentMethod: {
      type: String,
      enum: ['cod', 'card'],
      default: 'cod'
    },
    // هل تم الدفع؟
    isPaid: {
      type: Boolean,
      default: false
    },

    // ── ملاحظات ────────────────────────────────────────
    // ملاحظات إضافية من العميل
    notes: {
      type: String,
      default: ''
    }
  },
  {
    // يضيف createdAt و updatedAt تلقائياً
    timestamps: true
  }
);

// ── Index للبحث السريع ────────────────────────────────
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);