// ============================================================
// Reviews.jsx — صفحة عرض وإضافة التعليقات العامة على المتجر
// ============================================================
// تعرض: ملخص التقييمات، توزيع النجوم، قائمة التعليقات،
// فورم إضافة/تعديل تعليق، ترتيب وتصفح (pagination)
// ── بدون ربط بأي منتج — تعليقات عامة على المتجر ──
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Star, Send, Edit3, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import vid3 from '../assets/vid3.mp4';

// ── مكوّن النجوم التفاعلية (للعرض والاختيار) ─────────────────
// onRate = null → وضع العرض فقط | onRate = function → وضع الاختيار
const StarRating = ({ rating = 0, onRate = null, size = 20 }) => {
  // حالة الـ hover — تعرض النجوم المؤقتة عند التمرير
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onRate}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          className={`transition-transform duration-150 ${onRate ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
        >
          {/* تلوين النجمة حسب hover أو القيمة الفعلية */}
          <Star
            size={size}
            className={`transition-colors duration-150 ${
              (hover || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ── شريط تقدم النجمة الواحدة ──────────────────────────────────
// يعرض عدد التعليقات لكل مستوى نجمة مع شريط بصري
const RatingBar = ({ starNum, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      {/* رقم النجمة */}
      <span className="text-xs font-bold text-gray-500 w-4 text-right">{starNum}</span>
      <Star size={13} className="fill-amber-400 text-amber-400 flex-shrink-0" />
      {/* الشريط المتحرك */}
      <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* العدد */}
      <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
    </div>
  );
};

// ── كارد التعليق الواحد ───────────────────────────────────────
// يعرض بيانات التعليق + أزرار تعديل/حذف لصاحبه أو الأدمن
const ReviewCard = ({ review, currentUserId, isAdmin, onEdit, onDelete }) => {
  // التحقق هل المستخدم الحالي هو صاحب التعليق
  const isOwner = currentUserId && (review.user?._id === currentUserId || review.user === currentUserId);
  const displayName = review.user?.name || review.userName || 'Customer';
  const initial = displayName.charAt(0).toUpperCase();
  // تنسيق التاريخ
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="review-card group border border-gray-100 bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-200">
      {/* الهيدر: اسم المستخدم + أفاتار + تاريخ */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* أفاتار — أول حرف من الاسم */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{displayName}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{date}</p>
          </div>
        </div>
        {/* أزرار التعديل/الحذف — تظهر فقط لصاحب التعليق أو الأدمن */}
        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* زر التعديل — لصاحب التعليق فقط */}
            {isOwner && (
              <button onClick={() => onEdit(review)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                <Edit3 size={14} />
              </button>
            )}
            {/* زر الحذف — لصاحب التعليق أو الأدمن */}
            <button onClick={() => onDelete(review._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* تقييم النجوم */}
      <StarRating rating={review.rating} size={16} />

      {/* عنوان التعليق (اختياري — يظهر فقط لو موجود) */}
      {review.title && (
        <h4 className="text-sm font-bold text-gray-900 mt-3">{review.title}</h4>
      )}

      {/* نص التعليق */}
      <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// الصفحة الرئيسية: Reviews (تعليقات عامة على المتجر)
// ════════════════════════════════════════════════════════════════
const Reviews = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const toast = useToast();

  // ── حالة التعليقات ────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [sort, setSort] = useState('newest');

  // ── حالة فورم الكتابة/التعديل ─────────────────────────────
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── جلب التعليقات من الـ API (مع الترتيب والصفحة) ──────────
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await reviewsApi.getReviews({ page, limit: 5, sort });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setAvgRating(data.avgRating || 0);
      setBreakdown(data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } catch {
      console.error('Error fetching reviews');
    } finally {
      setLoadingReviews(false);
    }
  }, [page, sort]);

  // تشغيل الجلب عند تغيير الصفحة أو الترتيب
  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── إرسال تعليق جديد / تعديل تعليق موجود ─────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login first to leave a review.'); return; }
    if (formRating === 0) { toast.error('Please select a star rating.'); return; }
    if (!formComment.trim()) { toast.error('Please write your review.'); return; }

    setSubmitting(true);
    try {
      if (editingId) {
        // تعديل تعليق موجود
        await reviewsApi.updateReview(editingId, { rating: formRating, comment: formComment, title: formTitle });
        toast.success('Review updated successfully!');
      } else {
        // إضافة تعليق جديد
        await reviewsApi.addReview({ rating: formRating, comment: formComment, title: formTitle });
        toast.success('Review added successfully!');
      }
      // إعادة ضبط الفورم وتحديث القائمة
      resetForm();
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── ملء الفورم ببيانات التعليق لتعديله ────────────────────
  const handleEdit = (review) => {
    setEditingId(review._id);
    setFormRating(review.rating);
    setFormTitle(review.title || '');
    setFormComment(review.comment);
    // سكرول سلس لمنطقة الفورم
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── حذف تعليق (بتأكيد من المستخدم) ────────────────────────
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      toast.success('Review deleted.');
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  // ── إعادة ضبط كل حقول الفورم ──────────────────────────────
  const resetForm = () => {
    setEditingId(null);
    setFormRating(0);
    setFormTitle('');
    setFormComment('');
  };

  // ════════════════════════════════════════════════════════════
  // الـ JSX
  // ════════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="bg-white min-h-screen">

        {/* ── هيدر الصفحة ──────────────────────────────────── */}
        <div className="relative border-b border-gray-100 overflow-hidden">
          <video src={vid3} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">Customer Reviews</h1>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-3">What our customers are saying</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* ════ العمود الأيسر: ملخص التقييمات + فورم ════ */}
            <div className="lg:col-span-1 space-y-10">

              {/* ── ملخص التقييمات العام ─────────────────────── */}
              <div className="review-summary-card p-6 sm:p-8 border border-gray-100 bg-white">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Rating Overview</h2>
                {/* الرقم الكبير للمتوسط */}
                <div className="flex items-end gap-4 mb-6">
                  <span className="text-5xl font-serif font-bold text-gray-900 leading-none">{avgRating}</span>
                  <div>
                    <StarRating rating={Math.round(avgRating)} size={18} />
                    <p className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {/* أشرطة التوزيع — من 5 نجوم لـ 1 */}
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <RatingBar key={n} starNum={n} count={breakdown[n] || 0} total={total} />
                  ))}
                </div>
              </div>

              {/* ── فورم إضافة / تعديل تعليق ────────────────── */}
              <div id="review-form" className="p-6 sm:p-8 border border-gray-100 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                  {editingId ? 'Edit Your Review' : 'Write a Review'}
                </h3>

                {/* لو المستخدم مش مسجل — نعرض رسالة تسجيل دخول */}
                {!isLoggedIn ? (
                  <div className="text-center py-6">
                    <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">Login to share your experience</p>
                    <button onClick={() => navigate('/login')} className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-black transition-colors">
                      Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* اختيار النجوم */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Your Rating</label>
                      <StarRating rating={formRating} onRate={setFormRating} size={28} />
                    </div>
                    {/* حقل العنوان (اختياري) */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Title (optional)</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        maxLength={100}
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                      />
                    </div>
                    {/* حقل نص التعليق */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Your Review</label>
                      <textarea
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Share your thoughts about our store…"
                        rows={4}
                        maxLength={1000}
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                      />
                      {/* عداد الحروف */}
                      <p className="text-[10px] text-gray-300 text-right mt-1">{formComment.length}/1000</p>
                    </div>
                    {/* أزرار الإرسال / الإلغاء */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-grow flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-black transition-colors disabled:opacity-50"
                      >
                        <Send size={14} />
                        {submitting ? 'Sending…' : editingId ? 'Update Review' : 'Submit Review'}
                      </button>
                      {/* زر الإلغاء — يظهر فقط في وضع التعديل */}
                      {editingId && (
                        <button type="button" onClick={resetForm} className="px-4 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ════ العمود الأيمن: قائمة التعليقات ════ */}
            <div className="lg:col-span-2">
              {/* ── هيدر الترتيب ─────────────────────────────── */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-serif font-bold text-gray-900">
                  All Reviews <span className="text-gray-300 font-sans text-sm ml-2">({total})</span>
                </h2>
                {/* قائمة الترتيب */}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="border border-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white focus:outline-none focus:border-gray-900 transition-colors cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>

              {/* ── عرض التعليقات ─────────────────────────────── */}
              {loadingReviews ? (
                /* سبينر التحميل */
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                /* رسالة لو مفيش تعليقات */
                <div className="text-center py-20 border border-dashed border-gray-200">
                  <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm text-gray-400">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                /* قائمة التعليقات مع أنيميشن ظهور متتابع */
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={review._id} className="stagger-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <ReviewCard
                        review={review}
                        currentUserId={user?._id || user?.id}
                        isAdmin={user?.isAdmin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── أزرار تصفح الصفحات (Pagination) ──────────── */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {/* زر الصفحة السابقة */}
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2.5 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {/* أرقام الصفحات */}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 text-xs font-bold transition-colors ${
                        p === page
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {/* زر الصفحة التالية */}
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2.5 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;
