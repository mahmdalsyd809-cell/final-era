const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

/**
 * ========================================================
 * Admin Routes - /api/admin
 * ========================================================
 * جميع المسارات محمية: تحتاج Token + isAdmin = true
 * ========================================================
 */

// ── Middleware: حماية جميع مسارات الأدمن ─────────────────
router.use(auth);
router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ message: 'ممنوع: هذه المنطقة للمديرين فقط' });
  next();
});

// ══════════════════════════════════════════════════════════
// 📊 DASHBOARD
// ══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/dashboard
 * @desc    إحصائيات لوحة التحكم: الطلبات، المستخدمون، المبيعات، آخر الطلبات
 * @access  Admin
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalOrders, totalUsers, totalProducts,
      revenueAgg, pendingOrders, processingOrders,
      shippedOrders, deliveredOrders, cancelledOrders,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.find().populate('items.product', 'name image price').sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      totalOrders, totalUsers, totalProducts,
      revenue: revenueAgg[0]?.total || 0,
      ordersByStatus: {
        pending: pendingOrders, processing: processingOrders,
        shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ══════════════════════════════════════════════════════════
// 📦 PRODUCT MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/products
 * @desc    جلب كل المنتجات مع Pagination وبحث
 * @query   page, limit, category, q
 */
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** @route GET /api/admin/products/:id - جلب منتج واحد */
router.get('/products/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @route   POST /api/admin/products
 * @desc    إضافة منتج جديد
 * @body    { name, price, category, description?, image?, images?,
 *            sizes?, colors?, stockCount?, isNew?, isSale?, isFeatured? }
 */
router.post('/products', async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/** @route PUT /api/admin/products/:id - تعديل منتج */
router.put('/products/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/** @route DELETE /api/admin/products/:id - حذف منتج */
router.delete('/products/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════
// 👥 USER MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/users
 * @desc    جلب كل المستخدمين مع Pagination وبحث
 * @query   page, limit, q (بحث بالاسم أو الإيميل)
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [usersList, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter)
    ]);

    // Fetch order counts for each user
    for (let user of usersList) {
      user.ordersCount = await Order.countDocuments({ user: user._id });
    }

    res.json({ users: usersList, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** @route GET /api/admin/users/:id - جلب مستخدم واحد */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    تعديل مستخدم (تفعيل/تعطيل / منح أدمن)
 * @body    { isActive?, isAdmin?, name?, phone?, address? }
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, isAdmin, name, phone, address } = req.body;
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    حذف مستخدم (لا يمكن للأدمن حذف نفسه)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString())
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════
// 📋 ORDER MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/orders
 * @desc    جلب كل الطلبات مع فلترة وBachination
 * @query   page, limit, status, q (بحث بالعميل)
 */
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, q, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (q) filter.$or = [
      { 'customer.name': { $regex: q, $options: 'i' } },
      { 'customer.email': { $regex: q, $options: 'i' } }
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('items.product', 'name image price')
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter)
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** @route GET /api/admin/orders/:id - جلب طلب واحد */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    تحديث حالة الطلب
 * @body    { status?, isPaid?, notes? }
 */
router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    ).populate('items.product', 'name image price');
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/** @route DELETE /api/admin/orders/:id - حذف طلب */
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
