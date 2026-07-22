import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    toast.success(`${item.name} added to bag!`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart size={56} className="text-gray-200 mb-6" />
              <h2 className="text-xl font-serif text-gray-700 mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-gray-400 mb-8">Save items you love and come back to them anytime.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                Browse Shop <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, i) => (
                <div
                  key={item.id}
                  className="stagger-item bg-white border border-gray-100 group"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="block overflow-hidden aspect-[3/4] bg-gray-50">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={40} className="text-gray-200" />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{item.category}</p>
                    )}
                    <Link to={`/product/${item.id}`} className="block">
                      <h3 className="text-sm font-bold text-gray-900 hover:text-primary transition-colors mb-1 truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-bold text-gray-900 mb-4">
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-900 text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                      >
                        <ShoppingBag size={13} /> Add to Bag
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2.5 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
