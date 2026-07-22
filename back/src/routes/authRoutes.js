const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * دالة مساعدة: توليد JWT Token
 * @param {string} id - معرّف المستخدم
 * @param {boolean} isAdmin - هل هو أدمن؟
 * @returns {string} التوكن المشفّر (صالح 7 أيام)
 */
function generateToken(id, isAdmin) {
  return jwt.sign({ id, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * @route   POST /api/auth/register
 * @desc    تسجيل مستخدم جديد (Sign Up)
 * @access  Public
 * @body    { name, email, password, phone?, address? }
 * @returns { id, name, email, isAdmin, token }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // التحقق من عدم وجود الإيميل مسبقاً
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'هذا الإيميل مستخدم بالفعل' });
    }

    // إنشاء المستخدم الجديد (كلمة المرور تُشفَّر تلقائياً في الـ model)
    const user = new User({ name, email, password, phone, address });
    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id, user.isAdmin)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    تسجيل الدخول (Login)
 * @access  Public
 * @body    { email, password }
 * @returns { id, name, email, isAdmin, token }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم بالإيميل
    const user = await User.findOne({ email });

    // التحقق من كلمة المرور
    if (user && (await user.matchPassword(password))) {
      // التحقق من أن الحساب مفعّل
      if (!user.isActive) {
        return res.status(403).json({ message: 'هذا الحساب محظور، تواصل مع الدعم' });
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, user.isAdmin)
      });
    } else {
      res.status(401).json({ message: 'الإيميل أو كلمة المرور غير صحيحة' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    جلب بيانات المستخدم الحالي (Profile)
 * @access  Private (يحتاج Token)
 * @header  Authorization: Bearer <token>
 * @returns بيانات المستخدم بدون كلمة المرور
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route   PUT /api/auth/me
 * @desc    تحديث بيانات الملف الشخصي (Update Profile)
 * @access  Private (يحتاج Token)
 * @header  Authorization: Bearer <token>
 * @body    { name?, phone?, address?, avatar? }
 * @returns بيانات المستخدم بعد التحديث
 */
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // تحديث الحقول المُرسَلة فقط
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      avatar: user.avatar
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    تغيير كلمة المرور
 * @access  Private (يحتاج Token)
 * @header  Authorization: Bearer <token>
 * @body    { currentPassword, newPassword }
 * @returns { message: 'تم تغيير كلمة المرور بنجاح' }
 */
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // التحقق من كلمة المرور الحالية
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    // تحديث كلمة المرور (ستُشفَّر تلقائياً في الـ pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
