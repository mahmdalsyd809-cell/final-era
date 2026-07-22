import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, ShoppingBag, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// مكوّن التنبيه الفردي
const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
    error:   <XCircle size={18} className="text-red-500 flex-shrink-0" />,
    cart:    <ShoppingBag size={18} className="text-primary flex-shrink-0" />,
    info:    <Info size={18} className="text-blue-500 flex-shrink-0" />,
  };

  return (
    <div
      className={`flex items-center gap-3 bg-white border border-gray-100 shadow-lg px-5 py-4 min-w-[300px] max-w-[420px] transition-all duration-300 ${
        exiting ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: exiting ? 'none' : 'toastSlideIn 0.3s ease-out' }}
    >
      {icons[toast.type] || icons.info}
      <p className="text-sm text-gray-700 flex-grow">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }}
        className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// مكوّن الحاوية + Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  // اختصارات سريعة
  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    cart:    (msg, dur) => addToast(msg, 'cart', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* حاوية التنبيهات — أعلى يمين الشاشة */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-auto">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
