
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ShoppingBag, Menu, X, LogOut, Heart, User, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ImageSearch from './ImageSearch';

const Navbar = () => {
  const { cartCount, clearCart } = useCart();
  const { isLoggedIn, isAdmin, userName, logout } = useAuth();
  const { wishlistCount, clearWishlist } = useWishlist();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    clearCart();
    clearWishlist();
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  // إغلاق الـ dropdown لما يضغط بره
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About Us' },
    { to: '/product/random', label: 'Product Details' },
    { to: '/reviews', label: 'Reviews' },
   
  ];

  const isActive = (to) => {
    // Custom rule for Product Details: active for any /product/* route
    if (to === '/product/random') {
      return location.pathname.startsWith('/product/');
    }

    const [path, query] = to.split('?');
    if (path === '/') return location.pathname === '/';
    if (!query) return location.pathname === path && !location.search;
    return location.pathname === path && location.search === `?${query}`;
  };

  return (
    <>
      {/* Image Search Modal */}
      {imageSearchOpen && <ImageSearch onClose={() => setImageSearchOpen(false)} />}

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo — display only */}
            <div className="shrink-0 flex items-center">
              <span className="text-2xl font-serif font-bold tracking-[0.2em] text-gray-900 select-none">
                AEIRA
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    isActive(link.to)
                      ? 'text-gray-900 border-b border-gray-900 pb-1'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">

              {isLoggedIn ? (
                <>
                  {/* Image Search — hidden for admin */}
           

                  {/* Wishlist Icon — hidden for admin */}
                  {!isAdmin && (
                    <Link
                      to="/wishlist"
                      className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                      title="Wishlist"
                    >
                      <Heart size={20} />
                      {wishlistCount > 0 && (
                        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] min-w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none px-1">
                          {wishlistCount > 99 ? '99+' : wishlistCount}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Cart Icon — hidden for admin */}
                  {!isAdmin && (
                    <Link
                      to="/cart"
                      className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                      title="Shopping Bag"
                    >
                      <ShoppingBag size={20} />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] min-w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none px-1">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* User Dropdown — desktop only */}
                  <div className="relative hidden md:block" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(prev => !prev)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors px-2 py-1"
                    >
                      <User size={16} />
                      <span className="max-w-24 truncate uppercase tracking-widest text-[10px]">{userName}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl py-1 z-50">
                        {/* Wishlist & My Bag — hidden for admin */}
                        {!isAdmin && (
                          <>
                            <Link
                              to="/wishlist"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <span className="flex items-center gap-2"><Heart size={13} /> Wishlist</span>
                              {wishlistCount > 0 && (
                                <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                  {wishlistCount}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/cart"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <span className="flex items-center gap-2"><ShoppingBag size={13} /> My Bag</span>
                              {cartCount > 0 && (
                                <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={13} /> Dashboard
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-[11px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={13} /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons — not logged in */
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    id="login-btn"
                    to="/login"
                    className="text-[10px] font-bold uppercase tracking-widest text-white bg-gray-900 px-4 py-2 hover:bg-black transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ===== Mobile Menu ===== */}
      {mobileOpen && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* 
            ========================================================================
            NAVBAR SLIDER (Mobile Menu / Slide Bar)
            ========================================================================
            هنا يمكنك التعديل على شكل القائمة الجانبية في الموبايل
            - لتغيير العرض: عدل w-80 أو max-w-[85vw]
            - لتغيير الطول: عدل h-[100vh]
            - لتغيير اللون أو الظل: عدل bg-white أو shadow-2xl
            - الموقع ثابت: fixed top-0 right-0 
          */}
          <div
            className="fixed  top-0 right-0 w-80 max-w-[85vw] h-[100vh] bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <span className="text-xl font-serif font-bold tracking-[0.2em]">AEIRA</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User greeting */}
            {isLoggedIn && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Welcome back</p>
                <p className="text-sm font-bold text-gray-900">{userName}</p>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="grow p-6 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm font-medium border-b border-gray-50 transition-colors ${
                    isActive(link.to) ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn && (
                <>
                  {!isAdmin && (
                    <button
                      onClick={() => { setMobileOpen(false); setImageSearchOpen(true); }}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b border-gray-50 transition-colors w-full"
                    >
                      <Camera size={15} /> Search by Image
                    </button>
                  )}

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b border-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Heart size={15} /> Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b border-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2"><ShoppingBag size={15} /> Shopping Bag</span>
                    {cartCount > 0 && (
                      <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-primary border-b border-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    id="mobile-login-btn"
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-gray-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
