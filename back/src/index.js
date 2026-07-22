const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// ── استيراد مسارات الـ API ───────────────────────────────
const authRoutes = require('./routes/authRoutes');       // تسجيل الدخول والتسجيل
const storefrontRoutes = require('./routes/storefrontRoutes'); // واجهة المتجر العامة
const productRoutes = require('./routes/productRoutes'); // مسارات المنتجات العامة
const adminRoutes = require('./routes/adminRoutes');     // لوحة الأدمن
const orderRoutes = require('./routes/orderRoutes');     // الطلبات
const uploadRoutes = require('./routes/uploadRoutes');   // رفع الصور
const reviewRoutes = require('./routes/reviewRoutes');   // التعليقات والتقييمات
const wishlistRoutes = require('./routes/wishlistRoutes'); // قائمة الأمنيات
const cartRoutes = require('./routes/cartRoutes');         // سلة التسوق

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── تقديم الصور المرفوعة كـ Static Files ──────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);         // POST /register, POST /login, GET+PUT /me
app.use('/api/store', storefrontRoutes);  // GET /products, /featured, /categories, /new-arrivals
app.use('/api/products', productRoutes);  // CRUD عام للمنتجات
app.use('/api/admin', adminRoutes);       // لوحة الأدمن (محمية)
app.use('/api/orders', orderRoutes);      // إنشاء وتتبع الطلبات
app.use('/api/upload', uploadRoutes);     // رفع الصور
app.use('/api/reviews', reviewRoutes);   // التعليقات والتقييمات بالنجوم
app.use('/api/wishlist', wishlistRoutes); // قائمة الأمنيات (محمية بالتوكن)
app.use('/api/cart', cartRoutes);         // سلة التسوق (محمية بالتوكن)

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── تشغيل السيرفر ─────────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store');
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API Docs: see API_DOCS.md`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
