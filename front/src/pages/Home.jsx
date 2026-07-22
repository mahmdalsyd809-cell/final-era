import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loop from '../assets/loop2.mp4';
import coatImg from '../assets/coat.png';
import suitImg from '../assets/suit.png';
import accessories_red from '../assets/accessories_red.png';
import wooden_clock from '../assets/wooden_clock.png';
import { storeApi, getImageUrl } from '../services/api';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const heroRef = useRef(null);
  const videoContainerRef = useRef(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await storeApi.getProducts({ sort: 'newest' });
        const byNewest = (arr) => [...arr].sort((a, b) => (b._id > a._id ? 1 : -1));
        const sorted = byNewest(data.products || data || []);
        setTrendingProducts(sorted.slice(0, 8));
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchAll();
  }, []);

  const handleProductClick = useCallback((e, productId) => {
    if (isLoggedIn) {
      navigate(`/product/${productId}`);
      return;
    }
    // Guest — show overlay with arrow
    e.preventDefault();
    window.dispatchEvent(new Event('show-guest-overlay'));
  }, [isLoggedIn, navigate]);

  // Scroll zoom effect for hero video
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (videoContainerRef.current && heroRef.current) {
            const scrollY = window.scrollY;
            const heroHeight = heroRef.current.offsetHeight;
            const progress = Math.min(scrollY / (heroHeight * 0.7), 1);
            const scale = 1 + progress * 0.25;
            videoContainerRef.current.style.transform = `scale(${scale})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen relative">

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div
          ref={videoContainerRef}
          className="absolute inset-0 z-0"
          style={{ transform: 'scale(1)', willChange: 'transform', transformOrigin: 'center center' }}
        >
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover object-top"
          >
            <source src={loop} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
            The Art of Refined<br />
            Simplicity
          </h1>
          <Link
            to="/shop"
            className="bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Marquee Ribbon */}
      <div className="bg-[#111111] text-[#E5E5E5] py-3 overflow-hidden border-y border-[#333]">
        <div className="animate-marquee whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="mx-4">🌟 NEW ARRIVALS - DISCOVER THE LATEST COLLECTION</span>
          <span className="mx-4">🌟 LUXURY ELEVATED</span>
          <span className="mx-4">🌟 EXCLUSIVE STYLES</span>
          <span className="mx-4">🌟 SHOP NOW AND GET FREE SHIPPING</span>
          <span className="mx-4">🌟 NEW ARRIVALS - DISCOVER THE LATEST COLLECTION</span>
          <span className="mx-4">🌟 LUXURY ELEVATED</span>
          <span className="mx-4">🌟 EXCLUSIVE STYLES</span>
          <span className="mx-4">🌟 SHOP NOW AND GET FREE SHIPPING</span>
        </div>
      </div>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 md:mb-0">
            <p>New Collections</p>
          </div>
          <div className="max-w-xs text-right text-xs text-gray-500 leading-relaxed uppercase tracking-widest">
            <p>A series of exclusive wear on the essence the art of everything we wanted right now.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[700px]">

          {/* ── Men's Collection ── */}
          <Link
            to="/shop?category=Men"
            className="lg:w-[60%] h-[500px] lg:h-full relative overflow-hidden group block"
          >
            <img
              src={suitImg}
              alt="Men's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white text-[10px] uppercase tracking-widest z-10">
              <p className="font-bold">Men's Collection</p>
              <p className="mt-1">New In</p>
            </div>
          </Link>

          {/* ── Right Column ── */}
          <div className="lg:w-[40%] h-[700px] lg:h-full flex flex-col gap-6">

            {/* Women's Clothing */}
            <Link
              to="/shop?category=Women"
              className="flex-1 bg-[#5A6351] relative overflow-hidden group block"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-serif text-[#D4C6A8] italic opacity-80 leading-tight text-center">
                  The<br />New York
                </h2>
              </div>
              <div className="absolute bottom-8 left-8 text-white text-[10px] uppercase tracking-widest z-10">
                <p className="font-bold">Women's Clothing</p>
                <p className="mt-1">New In</p>
              </div>
            </Link>

            {/* Accessories */}
            <Link
              to="/shop?category=Accessories"
              className="flex-1 relative overflow-hidden group block bg-[#D14D4D]"
            >
              <img
                src={accessories_red}
                alt="Accessories"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-8 left-8 text-white text-[10px] uppercase tracking-widest z-10">
                <p className="font-bold">The Accessory</p>
                <p className="mt-1 text-white/80">New In</p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="bg-[#F8F9FA] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 text-[10px] uppercase tracking-widest">
            <p className="text-gray-500">Trending</p>
            <p className="font-bold text-black mt-2">Discover</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {trendingProducts.slice(4, 8).map((prod, i) => (
              <div
                key={prod._id || prod.id || i}
                onClick={(e) => handleProductClick(e, prod._id || prod.id)}
                className="group cursor-pointer block"
              >
                <div className="aspect-[3/4] bg-white mb-6 overflow-hidden">
                  <img src={getImageUrl(prod.image) || coatImg} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1">{prod.name}</h3>
                <p className="text-[10px] text-gray-500">${prod.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 text-[10px] uppercase tracking-widest">
            <p className="text-gray-500">Just Arrived</p>
            <p className="font-bold text-black mt-2">New Products</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {trendingProducts.slice(0, 4).map((prod, i) => (
              <div
                key={prod._id || prod.id || i}
                onClick={(e) => handleProductClick(e, prod._id || prod.id)}
                className="group cursor-pointer block"
              >
                <div className="aspect-[3/4] bg-gray-50 mb-6 overflow-hidden">
                  <img src={getImageUrl(prod.image) || coatImg} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1">{prod.name}</h3>
                <p className="text-[10px] text-gray-500">${prod.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-8">About Aeira</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-[1.1] mb-8">
                The Philosophy of<br />Fewer, Better<br />Things
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-10 max-w-md">
                We believe in conscious consumption. Our mission is to provide you with pieces that last a lifetime, both in quality and style. Explore the delicate balance of craftsmanship and modern aesthetics.
              </p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
                Read More
              </button>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 w-full">
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <img src={wooden_clock} alt="Philosophy" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>



    </div>
  );
};

export default Home;
