const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

/**
 * ========================================================
 * Order Routes - /api/orders
 * ========================================================
 * مسارات الطلبات للعملاء (لا تحتاج أدمن)
 * ========================================================
 */

/**
 * @route   POST /api/orders
 * @desc    إنشاء طلب جديد (Checkout)
 * @access  Public (يعمل للزوار والمستخدمين المسجّلين)
 * @body    {
 *   customer: { name, email, phone, address },
 *   items: [{ product, quantity, size, color, price, productName, productImage }],
 *   subtotal, shippingCost, totalAmount,
 *   paymentMethod?, notes?
 * }
 * @returns الطلب المُنشأ
 */
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    جلب تفاصيل طلب واحد (Order Tracking)
 * @access  Public - أي شخص عنده الـ ID يقدر يشوف الطلب
 * @param   id - معرّف الطلب
 * @returns تفاصيل الطلب مع بيانات المنتجات
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price');
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/orders/my/history
 * @desc    جلب سجل طلبات المستخدم المسجّل
 * @access  Private (يحتاج Token)
 * @header  Authorization: Bearer <token>
 * @returns قائمة طلبات المستخدم مرتبة من الأحدث
 */
router.get('/my/history', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    إلغاء طلب من قِبَل العميل (يُسمح فقط إذا كان pending)
 * @access  Public
 * @param   id - معرّف الطلب
 * @returns الطلب بعد الإلغاء
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    // لا يمكن إلغاء طلب تم شحنه أو تسليمه
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'لا يمكن إلغاء هذا الطلب لأنه تم شحنه بالفعل' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;