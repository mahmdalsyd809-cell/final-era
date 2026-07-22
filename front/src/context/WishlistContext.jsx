// ============================================================
// WishlistContext.jsx — إدارة قائمة الأمنيات عبر الـ API
// ============================================================
// البيانات تُخزَّن في الداتابيز (مرتبطة بالتوكن/المستخدم)
// بدلاً من localStorage — تتزامن على كل الأجهزة
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

// Hook مخصص لاستخدام الـ Wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  // قائمة المنتجات المفضلة (بيانات كاملة من الـ API)
  const [wishlistItems, setWishlistItems] = useState([]);
  // حالة التحميل الأول
  const [loading, setLoading] = useState(false);
  // جلب حالة تسجيل الدخول
  const { isLoggedIn } = useAuth();

  // ── جلب القائمة من الـ API عند تسجيل الدخول ──────────────
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistApi.getWishlist();
      // البيانات ترجع { wishlist: [Product] } — كل منتج ببياناته الكاملة
      setWishlistItems(
        (data.wishlist || []).map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image || '',
          category: p.category || '',
        }))
      );
    } catch {
      console.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // تشغيل الجلب لما المستخدم يسجل دخول أو يخرج
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ── إضافة / إزالة منتج (Toggle) عبر الـ API ──────────────
  const toggleWishlist = useCallback(async (product) => {
    if (!isLoggedIn) return;
    const productId = product._id || product.id;
    try {
      const data = await wishlistApi.toggleItem(productId);
      if (data.added) {
        // المنتج اتضاف → نضيفه في الـ state
        setWishlistItems(prev => [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image || '',
          category: product.category || '',
        }]);
      } else {
        // المنتج اتشال → نشيله من الـ state
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch {
      console.error('Failed to toggle wishlist');
    }
  }, [isLoggedIn]);

  // ── إزالة منتج معين عبر الـ API ──────────────────────────
  const removeFromWishlist = useCallback(async (id) => {
    if (!isLoggedIn) return;
    try {
      await wishlistApi.removeItem(id);
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    } catch {
      console.error('Failed to remove from wishlist');
    }
  }, [isLoggedIn]);

  // ── التحقق هل المنتج في القائمة ──────────────────────────
  const isWishlisted = useCallback((productId) => {
    const id = productId?._id || productId?.id || productId;
    return wishlistItems.some(item => item.id === id);
  }, [wishlistItems]);

  // ── مسح القائمة بالكامل عبر الـ API ──────────────────────
  const clearWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlistItems([]);
      return;
    }
    try {
      await wishlistApi.clearAll();
      setWishlistItems([]);
    } catch {
      console.error('Failed to clear wishlist');
    }
  }, [isLoggedIn]);

  // عدد المنتجات في القائمة
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
      wishlistCount,
      loading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
