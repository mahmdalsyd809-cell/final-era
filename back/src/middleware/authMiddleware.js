const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware للتحقق من صحة التوكن (JWT)
 * يُضاف على أي Route محتاج حماية
 */
const protect = async (req, res, next) => {
  let token;

  // التحقق من وجود التوكن في الهيدر
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح لك. يرجى تسجيل الدخول أولاً.' });
  }

  try {
    // فك تشفير التوكن والتحقق من صحته
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // جلب بيانات المستخدم من قاعدة البيانات (بدون كلمة المرور)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'هذا الحساب غير مفعّل.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'التوكن غير صالح أو منتهي الصلاحية.' });
  }
};

/**
 * Middleware للتحقق من الدور (Role)
 * الاستخدام: authorize('admin') أو authorize('admin', 'employee')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const isAdmin = req.user && req.user.isAdmin;
    
    // إذا كان المطلوب 'admin' نتحقق من isAdmin
    if (roles.includes('admin') && isAdmin) {
      return next();
    }

    // هنا يمكن إضافة شروط لأدوار أخرى إذا تم إضافتها للموديل لاحقاً
    
    return res.status(403).json({
      message: `ليس لديك صلاحية. هذه العملية متاحة فقط لـ: ${roles.join(', ')}`
    });
  };
};

module.exports = { protect, authorize };
