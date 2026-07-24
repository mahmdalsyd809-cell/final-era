// ملف api.js - مسؤول عن جميع الاتصالات مع السيرفر الخلفي (Backend)
// تم تحويله ليستخدم axios بدلاً من fetch

import axios from 'axios';

// إنشاء instance من axios مع الإعدادات الأساسية
// يقرأ الرابط من ملف .env (VITE_API_URL) بدلاً من الـ Proxy
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // مثال: http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: بناء URL كامل للصور المرفوعة
// لو الصورة مسار نسبي (/uploads/...) نضيف عليه رابط السيرفر
// لو الصورة رابط كامل (http://...) نرجعها زي ما هي
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // رابط خارجي (Unsplash مثلاً)
  return `${API_BASE}${path}`; // مسار نسبي → رابط كامل
};

// Interceptor للطلبات: يضيف التوكن تلقائياً قبل كل طلب
axiosInstance.interceptors.request.use(
  (config) => {
    // نحدد التوكن حسب نوع الطلب:
    // لو الطلب لصفحات admin → نستخدم tokenAdmin
    // لو الطلب عادي → نستخدم token المستخدم
    const isAdminRequest = config.url?.startsWith('/admin');
    const token = isAdminRequest
      ? localStorage.getItem('tokenAdmin')
      : (localStorage.getItem('token') || localStorage.getItem('tokenAdmin'));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]:', error);
    return Promise.reject(error);
  }
);

// Interceptor للاستجابات: يطبع النتائج والأخطاء + يعالج 401 تلقائياً
axiosInstance.interceptors.response.use(
  (response) => {
    // طباعة النتيجة الناجحة في الكونسول
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    return response.data; // نرجع البيانات مباشرة بدون .data.data
  },
  (error) => {
    // طباعة الخطأ في الكونسول
    const errMsg = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);

    // لو التوكن منتهي أو غير صالح (401) → نمسح التوكنات ونوجه للـ Login
    if (error.response?.status === 401) {
      // لا نمسح كل localStorage — فقط بيانات المصادقة
      localStorage.removeItem('token');
      localStorage.removeItem('tokenAdmin');
      localStorage.removeItem('name');

      // نتأكد إننا مش بالفعل في صفحة Login (لتجنب loop)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(errMsg));
  }
);

// 1. نظام الحسابات (Authentication)
export const authApi = {
  // تسجيل مستخدم جديد - البيانات المطلوبة: name, email, password, phone, address
  register: (userData) => axiosInstance.post('/auth/register', userData),

  // تسجيل الدخول - البيانات المطلوبة: email, password
  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  // جلب بيانات المستخدم الحالي (يحتاج توكن)
  getMe: () => axiosInstance.get('/auth/me'),

  // تحديث الملف الشخصي - البيانات: name, phone, address, avatar
  updateMe: (userData) => axiosInstance.put('/auth/me', userData),

  // تغيير كلمة المرور - البيانات: currentPassword, newPassword
  changePassword: (passwords) => axiosInstance.put('/auth/change-password', passwords),
};

// 2. المتجر والمنتجات (Store / Products)
export const storeApi = {
  // جلب المنتجات مع الفلترة - query params: category, q, priceMin, priceMax, sort, inStock
  getProducts: (params = {}) => axiosInstance.get('/store/products', { params }),

  // تفاصيل منتج معين باستخدام الـ ID
  getProductById: (id) => axiosInstance.get(`/store/products/${id}`),

  // المنتجات المميزة للصفحة الرئيسية
  getFeaturedProducts: () => axiosInstance.get('/store/products/featured'),

  // قائمة الفئات وعدد المنتجات
  getCategories: () => axiosInstance.get('/store/categories'),
};

// 3. الطلبات (Orders)
export const ordersApi = {
  // إنشاء طلب جديد
  // البيانات: customer{name,email,phone,address}, items[{product,quantity,size,color,price}]
  // subtotal, shippingCost, totalAmount, paymentMethod, notes
  createOrder: (orderData) => axiosInstance.post('/orders', orderData),

  // سجل طلبات المستخدم الحالي (يحتاج توكن)
  getMyHistory: () => axiosInstance.get('/orders/my/history'),

  // تتبع طلب معين بالـ ID
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
};

// 4. لوحة تحكم الأدمن (Admin) - جميعها تحتاج tokenAdmin
export const adminApi = {
  // إحصائيات لوحة التحكم (revenue, ordersCount, productsCount, customersCount)
  getDashboard: () => axiosInstance.get('/admin/dashboard'),

  // رفع صورة منتج - ترسل الملف كـ FormData وترجع { url }
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // جلب جميع المنتجات
  getProducts: () => axiosInstance.get('/admin/products'),

  // إضافة أو تعديل منتج
  // البيانات: name, price, category, description, image, images, sizes, colors, stockCount, isNewProduct, isSale, isFeatured
  saveProduct: (id, productData) =>
    id
      ? axiosInstance.put(`/admin/products/${id}`, productData)
      : axiosInstance.post('/admin/products', productData),
      
  // حذف منتج
  deleteProduct: (id) => axiosInstance.delete(`/admin/products/${id}`),

  // جلب جميع المستخدمين
  getUsers: () => axiosInstance.get('/admin/users'),

  // تعديل بيانات مستخدم - البيانات: isActive, isAdmin, name, phone, address
  updateUser: (id, userData) => axiosInstance.put(`/admin/users/${id}`, userData),

  // حذف مستخدم
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),

  // جلب جميع الطلبات
  getOrders: (params = {}) => axiosInstance.get('/admin/orders', { params }),

  // تغيير حالة الطلب - البيانات: status, isPaid
  updateOrder: (id, statusData) => axiosInstance.put(`/admin/orders/${id}`, statusData),
};

// 5. التعليقات والتقييمات العامة (Reviews) — بدون ربط بمنتج
export const reviewsApi = {
  // جلب جميع التعليقات - query: page, limit, sort (newest|oldest|highest|lowest)
  // الاستجابة: { reviews, total, page, pages, avgRating, ratingBreakdown }
  getReviews: (params = {}) =>
    axiosInstance.get('/reviews', { params }),

  // إضافة تعليق جديد (يحتاج توكن)
  // البيانات: { rating, comment, title? }
  addReview: (reviewData) =>
    axiosInstance.post('/reviews', reviewData),

  // تعديل تعليق (صاحب التعليق فقط)
  // البيانات: { rating?, comment?, title? }
  updateReview: (reviewId, reviewData) =>
    axiosInstance.put(`/reviews/${reviewId}`, reviewData),

  // حذف تعليق (صاحب التعليق أو الأدمن)
  deleteReview: (reviewId) =>
    axiosInstance.delete(`/reviews/${reviewId}`),

  // جلب ملخص التقييمات
  // الاستجابة: { avgRating, numReviews, ratingBreakdown }
  getSummary: () =>
    axiosInstance.get('/reviews/summary'),
};

// 6. قائمة الأمنيات (Wishlist) — تُخزَّن في الداتابيز مرتبطة بالتوكن
export const wishlistApi = {
  // جلب القائمة الكاملة مع بيانات المنتجات
  // الاستجابة: { wishlist: [Product] }
  getWishlist: () => axiosInstance.get('/wishlist'),

  // إضافة أو إزالة منتج (Toggle)
  // الاستجابة: { wishlist: [ids], added: boolean }
  toggleItem: (productId) => axiosInstance.post(`/wishlist/toggle/${productId}`),

  // إزالة منتج معين
  removeItem: (productId) => axiosInstance.delete(`/wishlist/${productId}`),

  // مسح القائمة بالكامل
  clearAll: () => axiosInstance.delete('/wishlist'),
};

// 7. سلة التسوق (Cart) — تُخزَّن في الداتابيز مرتبطة بالتوكن
export const cartApi = {
  // جلب السلة
  getCart: () => axiosInstance.get('/cart'),

  // إضافة للسلة
  addToCart: (productId, quantity, size, color) => 
    axiosInstance.post('/cart', { productId, quantity, size, color }),

  // تعديل كمية
  updateQuantity: (itemId, quantity) => 
    axiosInstance.put(`/cart/${itemId}`, { quantity }),

  // إزالة منتج
  removeFromCart: (itemId) => axiosInstance.delete(`/cart/${itemId}`),

  // تفريغ السلة بالكامل
  clearCart: () => axiosInstance.delete('/cart'),
};
