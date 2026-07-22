import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { isLoggedIn, userName, user } = useAuth();

  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // حساب الإجماليات
  const shipping    = 0;
  const tax         = subtotal * 0.1;
  const totalAmount = subtotal + shipping + tax;

  // إتمام الطلب وإرساله للـ API
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new Event('show-guest-overlay'));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const orderData = {
        user: user?.id,
        customer: {
          name:    userName,
          email:   'user@example.com',
          phone:   '0000000000',
          address: 'Will be collected at checkout',
        },
        items: cartItems.map(({ id, quantity, size, color, price }) => ({
          product: id, quantity, size, color, price,
        })),
        subtotal,
        shippingCost: shipping,
        totalAmount,
        paymentMethod: 'card',
        notes: '',
      };

      await ordersApi.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif mb-12">Shopping Bag</h1>

          <div className="flex flex-col lg:flex-row gap-16">

            {/* قائمة المنتجات */}
            <div className="flex-grow space-y-8">
              {cartItems.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                  <p className="text-gray-500 mb-2">Your bag is empty.</p>
                  <p className="text-sm text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
                  <Link
                    to="/shop"
                    className="inline-block bg-gray-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 py-8 border-b border-gray-100 last:border-0">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-32 h-40 object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size} | Color: {item.color}</p>
                      </div>
                      <p className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      {/* التحكم في الكمية */}
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)} className="p-2 text-gray-500 hover:text-black transition-colors"><Minus size={14} /></button>
                        <span className="px-4 text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, +1)} className="p-2 text-gray-500 hover:text-black transition-colors"><Plus size={14} /></button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id, item.size, item.color);
                          toast.info('Item removed from bag');
                        }}
                        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length > 0 && (
                <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors pt-8">
                  <ArrowLeft size={16} className="mr-2" /> Continue Shopping
                </Link>
              )}
            </div>

            {/* ملخص الطلب */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-96">
                <div className="bg-gray-50 p-8 space-y-6 sticky top-24">
                  <h3 className="text-xl font-serif mb-4">Order Summary</h3>

                  {errorMsg && (
                    <p className="text-red-500 text-xs text-center">{errorMsg}</p>
                  )}

                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Complimentary' : `$${shipping}`}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-4">
                      <span>Total</span><span>${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    className="w-full bg-gray-900 text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">Secure Checkout</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
