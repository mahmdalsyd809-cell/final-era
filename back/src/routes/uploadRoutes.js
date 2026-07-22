const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * ========================================================
 * Upload Routes - /api/upload
 * ========================================================
 * رفع الصور للمنتجات
 * الصور تُحفظ في مجلد uploads/products/
 * وتُقدَّم كـ static files من /uploads/
 * ========================================================
 */

// ── إعداد مجلد التخزين ──────────────────────────────────
const uploadsDir = path.join(__dirname, '../../uploads/products');

// إنشاء المجلد لو مش موجود
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── إعداد Multer ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // اسم فريد: timestamp + رقم عشوائي + الامتداد الأصلي
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// فلترة أنواع الملفات: صور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بـ: JPG, PNG, GIF, WEBP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
  },
});

// ══════════════════════════════════════════════════════════
// 📸 UPLOAD ENDPOINTS
// ══════════════════════════════════════════════════════════

/**
 * @route   POST /api/upload/image
 * @desc    رفع صورة واحدة
 * @access  Admin (محمي بـ auth + isAdmin)
 * @returns { url: "/uploads/products/filename.jpg" }
 */
router.post('/image', auth, (req, res, next) => {
  // التحقق من صلاحيات الأدمن
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'ممنوع: هذه العملية للمديرين فقط' });
  }
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
  }

  // بناء الـ URL النسبي
  const imageUrl = `/uploads/products/${req.file.filename}`;

  res.status(201).json({
    message: 'تم رفع الصورة بنجاح',
    url: imageUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

/**
 * @route   POST /api/upload/images
 * @desc    رفع عدة صور (حتى 5 صور)
 * @access  Admin
 * @returns { urls: ["/uploads/products/file1.jpg", ...] }
 */
router.post('/images', auth, (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'ممنوع: هذه العملية للمديرين فقط' });
  }
  next();
}, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'لم يتم رفع أي صور' });
  }

  const urls = req.files.map(file => `/uploads/products/${file.filename}`);

  res.status(201).json({
    message: `تم رفع ${req.files.length} صورة بنجاح`,
    urls,
    count: req.files.length,
  });
});

// ── معالج أخطاء Multer ──────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'عدد الملفات أكثر من المسموح (5 صور كحد أقصى)' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
