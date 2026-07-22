import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Minus, Plus, Heart, ShieldCheck, Truck, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { storeApi, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import coatImg from '../assets/coat.png';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const toast = useToast();
  const { isLoggedIn } = useAuth();

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [quantity, setQuantity]           = useState(1);
  const [selectedSize, setSelectedSize]   = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [selectedImage, setSelectedImage]   = useState(null);

  // ── حالة كاروسيل المنتجات المشابهة ────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const carouselRef = useRef(null);

  // ── جلب بيانات المنتج الأساسي ──────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storeApi.getProductById(id);
        setProduct(data);
        setSelectedImage(data.image || null);
        if (data.sizes?.length)  setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      } catch (err) {
        console.error('خطأ في جلب المنتج:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // ── جلب منتجات مشابهة (من نفس الفئة) للكاروسيل ─────────────
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // جلب منتجات من نفس الفئة (أو كل المنتجات لو مفيش فئة)
        const params = product?.category ? { category: product.category } : {};
        const data = await storeApi.getProducts(params);
        const list = data.products || data || [];
        // استبعاد المنتج الحالي من القائمة
        setRelatedProducts(list.filter(p => p._id !== id).slice(0, 10));
      } catch {
        console.error('Error fetching related products');
      }
    };
    if (product) fetchRelated();
  }, [product, id]);

  // ── دوال تمرير الكاروسيل يمين/شمال ─────────────────────────
  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // شاشات التحميل والخطأ
  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div></Layout>;
  if (!product) return <Layout><div className="min-h-screen flex items-center justify-center text-red-500">Product not found.</div></Layout>;

  const sizes  = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product.colors && product.colors.length > 0 ? product.colors : ['#00332B', '#000000', '#9ca3af'];

  // إضافة للسلة
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new Event('show-guest-overlay'));
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.cart(`${product.name} added to your bag!`);

    // Animation feedback
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* الصور */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={getImageUrl(selectedImage) || coatImg}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {(() => {
                const allImages = [
                  product.image,
                  ...(product.images || []),
                ].filter(Boolean);
                return allImages.length > 1 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`aspect-square bg-gray-100 overflow-hidden cursor-pointer border-2 transition-colors ${
                          getImageUrl(selectedImage) === getImageUrl(img)
                            ? 'border-gray-900'
                            : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        <img src={getImageUrl(img)} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            {/* التفاصيل */}
            <div className="flex flex-col">
              <div className="border-b border-gray-100 pb-8 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{product.category}</span>
                <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
                <p className="text-2xl font-bold text-gray-900">${product.price?.toLocaleString()}</p>
              </div>

              <p className="text-gray-500 leading-relaxed mb-10">{product.description}</p>

              <div className="space-y-8 mb-12">

                {/* الألوان */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
                    Color <span className="text-gray-400 font-normal lowercase ml-1">({selectedColor})</span>
                  </h4>
                  <div className="flex space-x-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* المقاسات */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Size: {selectedSize}</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-xs font-bold border transition-all ${selectedSize === size ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-900'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الكمية والإضافة للسلة */}
                <div className="flex space-x-4">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-4 text-gray-500 hover:text-black transition-colors"><Minus size={16} /></button>
                    <span className="px-4 font-bold text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-4 text-gray-500 hover:text-black transition-colors"><Plus size={16} /></button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-grow py-4 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                      addedAnimation
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-black'
                    }`}
                  >
                    {addedAnimation ? (
                      <><Check size={16} /> Added!</>
                    ) : (
                      'Add to Bag'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      toggleWishlist(product);
                      const wishlisted = isWishlisted(product._id);
                      toast[wishlisted ? 'info' : 'success'](
                        wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`
                      );
                    }}
                    className={`p-4 border transition-all ${
                      isWishlisted(product._id)
                        ? 'border-red-300 text-red-500 bg-red-50'
                        : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Heart size={20} className={isWishlisted(product._id) ? 'fill-red-500' : ''} />
                  </button>
                </div>
              </div>

              {/* مزايا الشحن */}
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  <Truck size={20} className="text-gray-900" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheck size={20} className="text-gray-900" />
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* كاروسيل المنتجات المشابهة — Complete the Look       */}
      {/* ════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* ── هيدر القسم + أزرار التمرير ──────────────── */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Complete the Look</h2>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">You may also like</p>
              </div>
              {/* أزرار السكرول — تظهر فقط لو فيه أكتر من 4 منتجات */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── الكاروسيل الأفقي (scrollable) ──────────── */}
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  className="group flex-shrink-0 w-[220px] sm:w-[240px] snap-start"
                >
                  {/* صورة المنتج */}
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Badge للمنتج الجديد أو الخصم */}
                    {item.isNew && (
                      <span className="absolute top-3 left-3 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                        New
                      </span>
                    )}
                    {item.isSale && (
                      <span className="absolute top-3 right-3 bg-accent text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                        Sale
                      </span>
                    )}
                  </div>
                  {/* بيانات المنتج */}
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    ${item.price?.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>

            {/* ── رابط عرض كل المنتجات ───────────────────── */}
            <div className="text-center mt-10">
              <Link
                to="/shop"
                className="inline-block text-[10px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetails;
