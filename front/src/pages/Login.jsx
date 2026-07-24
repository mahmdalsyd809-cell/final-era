import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [isLogin, setIsLogin] = useState(!location.state?.register);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading]   = useState(false);

  // Pop animation state
  const [popKey, setPopKey] = useState(0);

  // Re-trigger pop animation when switching between login/register
  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setPopKey(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        // تسجيل الدخول
        const res = await authApi.login({ email, password });
        login(res); // استخدام AuthContext بدل localStorage مباشرة

        // لو isAdmin → توجيه للداشبورد
        if (res.isAdmin) {
          toast.success('Welcome back, Admin! 🎉');
          navigate('/admin');
        } else {
          toast.success('Signed in successfully!');
          navigate('/');
        }
      } else {
        // إنشاء حساب جديد — الحقول: name, email, password
        const res = await authApi.register({ name, email, password });
        login(res); // استخدام AuthContext
        toast.success('Account created successfully! 🎉');
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ في الاتصال');
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="login-bg relative flex-grow flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Animated blur background orbs */}
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>

        {/* Form Card with pop animation */}
        <div key={popKey} className="login-card relative z-10 max-w-md w-full bg-white/90 backdrop-blur-xl p-10 shadow-2xl border border-white/40 rounded-sm">

          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="text-3xl font-serif font-bold tracking-[0.2em] text-gray-900 block mb-2">
              AEIRA
            </Link>
            <h2 className="text-2xl font-serif text-gray-900 mt-6">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin ? 'Sign in to continue.' : 'Join us for exclusive access.'}
            </p>
          </div>

          {/* رسالة الخطأ */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded text-center mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* الاسم (فقط عند التسجيل) */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 focus:outline-none focus:border-gray-900 text-sm transition-colors"
                />
                <User className="absolute right-4 top-[38px] text-gray-400" size={18} />
              </div>
            )}

            {/* البريد الإلكتروني */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 focus:outline-none focus:border-gray-900 text-sm transition-colors"
              />
              <Mail className="absolute right-4 top-[38px] text-gray-400" size={18} />
            </div>

            {/* كلمة المرور */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 focus:outline-none focus:border-gray-900 text-sm transition-colors"
              />
              <Lock className="absolute right-4 top-[38px] text-gray-400" size={18} />
            </div>
            
            {/* إظهار كلمة المرور */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-3.5 h-3.5 text-gray-900 bg-gray-100 border-gray-300 rounded cursor-pointer accent-gray-900"
              />
              <label htmlFor="show-password" className="ml-2 text-xs text-gray-600 cursor-pointer">
                Show Password 
              </label>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center group disabled:opacity-60 rounded-sm"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />}
            </button>
          </form>

          {/* التبديل بين login/register */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={handleToggle}
              className="ml-2 font-bold uppercase tracking-widest text-[10px] text-gray-900 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
