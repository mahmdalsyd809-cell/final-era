import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const GuestOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const arrowRef = useRef(null);
  const rafRef = useRef(null);
  const location = useLocation();

  // Listen for the custom event
  useEffect(() => {
    const handleShowOverlay = () => {
      setShowOverlay(true);
    };
    window.addEventListener('show-guest-overlay', handleShowOverlay);
    return () => {
      window.removeEventListener('show-guest-overlay', handleShowOverlay);
    };
  }, []);

  // Auto-hide overlay after 4 seconds
  useEffect(() => {
    if (!showOverlay) return;
    const timer = setTimeout(() => setShowOverlay(false), 4000);
    return () => clearTimeout(timer);
  }, [showOverlay]);

  // Hide overlay on route change
  useEffect(() => {
    setShowOverlay(false);
  }, [location.pathname]);

  // Live-track Login button position + highlight it above overlay
  useEffect(() => {
    if (!showOverlay) return;

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.classList.add('login-btn-highlight');
    }

    const track = () => {
      const desktopBtn = document.getElementById('login-btn');
      const mobileLoginBtn = document.getElementById('mobile-login-btn');
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');

      // Determine which button is currently visible
      let target = null;
      if (mobileLoginBtn && mobileLoginBtn.offsetParent !== null) {
        target = mobileLoginBtn;
      } else if (desktopBtn && desktopBtn.offsetParent !== null) {
        target = desktopBtn;
      } else if (mobileMenuBtn && mobileMenuBtn.offsetParent !== null) {
        target = mobileMenuBtn;
      }

      if (target && arrowRef.current) {
        const rect = target.getBoundingClientRect();
        arrowRef.current.style.left = `${rect.left + rect.width / 2}px`;
        arrowRef.current.style.top = `${rect.bottom + 10}px`;
      }
      rafRef.current = requestAnimationFrame(track);
    };
    rafRef.current = requestAnimationFrame(track);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (loginBtn) {
        loginBtn.classList.remove('login-btn-highlight');
      }
    };
  }, [showOverlay]);

  const dismissOverlay = useCallback(() => setShowOverlay(false), []);

  if (!showOverlay) return null;

  return (
    <>
      {/* Mobile Popup */}
      <div className="md:hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={dismissOverlay}>
        <div
          className="bg-white p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-serif mb-2">Login Required</h3>
          <p className="text-sm text-gray-500 mb-6">Please log in or register to view product details.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login" onClick={dismissOverlay} className="w-full bg-gray-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
              Login
            </Link>
            <Link to="/login" state={{ register: true }} onClick={dismissOverlay} className="w-full border border-gray-900 text-gray-900 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Arrow Overlay */}
      <div className="hidden md:block login-overlay" onClick={dismissOverlay}>
        <div ref={arrowRef} className="login-arrow-indicator">
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
            <path
              d="M16 48 L16 10 M6 20 L16 10 L26 20"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default GuestOverlay;
