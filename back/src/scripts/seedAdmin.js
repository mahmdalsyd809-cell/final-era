const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// استيراد موديل المستخدم
const User = require('../models/User');

/**
 * سكريبت لإنشاء حساب الـ Admin الافتراضي
 * يُشغَّل مرة واحدة فقط عند إعداد السيرفر
 * الأمر: node src/scripts/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store');
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // التحقق مما إذا كان الحساب موجوداً بالفعل
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('⚠️  حساب الأدمن موجود بالفعل، يتم التأكد من صلاحيات الأدمن...');
      existingUser.isAdmin = true;
      // إذا كنت تريد تحديث كلمة المرور أيضاً يمكنك فعل ذلك هنا
      // existingUser.password = adminPassword; 
      await existingUser.save();
      console.log('✅ تم تحديث صلاحيات الأدمن للحساب:', adminEmail);
      process.exit(0);
    }

    // إنشاء حساب الأدمن
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@admin.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      isAdmin: true,
  
    });

    console.log('🎉 تم إنشاء حساب الأدمن بنجاح!');
    console.log('📧 البريد الإلكتروني:', admin.email);
    console.log('🔑 كلمة المرور:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('⚠️  يُنصح بتغيير كلمة المرور بعد أول دخول.');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
};

seedAdmin();
