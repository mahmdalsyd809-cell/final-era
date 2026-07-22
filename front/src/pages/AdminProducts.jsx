import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BarChart2, Settings, LogOut, Plus, Search,
  MoreVertical, AlertTriangle, Upload, X, Store,
} from 'lucide-react';
import { adminApi, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import fit1Url   from '../assets/fit1.jpg';
import fit2Url   from '../assets/fit2.jpg';
import fit3Url   from '../assets/fit3.jpg';
import coatUrl   from '../assets/coat.png';
import dressUrl  from '../assets/formal_dress.png';
import suitUrl   from '../assets/formal_suit.png';

// ====== مكوّن Sidebar مشترك مع الداشبورد ======
const Sidebar = ({ active }) => {
  const navigate  = useNavigate();
  const { userName: adminName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/admin/products',  icon: Package,         label: 'Products'   },
    { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders'     },
    { to: '/admin/customers', icon: Users,           label: 'Customers'  },
    { to: '/',                icon: Store,           label: 'Storefront' },
  ];

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0 hidden lg:flex">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="text-xl font-serif font-bold tracking-[0.2em]">AEIRA</Link>
        <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow px-3 py-6 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to} to={to}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active === label
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={16} /><span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-4 px-1">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
            {adminName[0]}
          </div>
          <span className="text-xs text-gray-300 truncate">{adminName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 w-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut size={14} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// ====== Modal إضافة منتج جديد ======
const AddProductModal = ({ onClose, onSuccess }) => {
  const fileRef = useRef();
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(null);
  const [imageFile, setImageFile] = useState(null); // الملف الفعلي للرفع
  const [form, setForm] = useState({
    name: '', category: 'Apparel', sku: '',
    price: '', stockCount: '', description: '', image: '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // معاينة الصورة بعد اختيارها (بدون رفع بعد)
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // التحقق من الحجم (5 ميجا كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImageFile(file); // نحفظ الملف الفعلي
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image;

      // لو في ملف صورة جديد، نرفعه أولاً للسيرفر
      if (imageFile) {
        setUploading(true);
        const uploadRes = await adminApi.uploadImage(imageFile);
        imageUrl = uploadRes.url; // مثال: "/uploads/products/123456.jpg"
        setUploading(false);
      }

      await adminApi.saveProduct(null, {
        name:        form.name,
        category:    form.category,
        price:       Number(form.price),
        stockCount:  Number(form.stockCount),
        description: form.description,
        image:       imageUrl,
        sizes:  ['S','M','L','XL'],
        colors: ['Black'],
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setUploading(false);
      console.error('خطأ في حفظ المنتج:', err.message);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // إغلاق عند الضغط خارج الـ modal
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  const categories = ['Apparel', 'Homewear', 'Accessories', 'Footwear', 'Outerwear', 'Suits', 'Knitwear'];

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* === العمود الأيسر === */}
            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Product Name</label>
                <input
                  type="text" required value={form.name} onChange={set('name')}
                  placeholder="e.g. Raw Silk Overshirt"
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Category</label>
                <select
                  value={form.category} onChange={set('category')}
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-white"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* SKU + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">SKU</label>
                  <input
                    type="text" value={form.sku} onChange={set('sku')}
                    placeholder="Auto if empty"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Price ($)</label>
                  <input
                    type="number" required min="0" value={form.price} onChange={set('price')}
                    placeholder="0"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              {/* Stock Count */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Stock Count</label>
                <input
                  type="number" required min="0" value={form.stockCount} onChange={set('stockCount')}
                  placeholder="0"
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Product Description</label>
                <textarea
                  rows={4} value={form.description} onChange={set('description')}
                  placeholder="Describe the product..."
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none"
                />
              </div>
            </div>

            {/* === العمود الأيمن: رفع الصورة === */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Image Upload</label>
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-sm aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Upload size={28} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-xs text-gray-400">Drag &amp; Drop</p>
                    <p className="text-[10px] text-gray-300 mt-1">Product image here</p>
                    <p className="text-[10px] text-gray-300">or</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 underline cursor-pointer">Browse</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {preview && (
                <button type="button" onClick={() => { setPreview(null); setImageFile(null); setForm(p => ({...p, image:''})); }}
                  className="mt-2 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button" onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-60"
            >
              <Plus size={14} />
              {uploading ? 'Uploading Image...' : saving ? 'Saving...' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====== الصفحة الرئيسية لإدارة المنتجات ======
const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding]     = useState(false);
  const [seedDone, setSeedDone]   = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data.products || data || []);
    } catch (err) {
      console.error('خطأ في جلب المنتجات:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // ── Seed home cards from local assets ─────────────────────
  const seedHomeCards = async () => {
    const items = [
      { url: fit1Url,  name: 'Summer Fit',     category: 'new',       price: 120, description: 'Fresh summer look from our new collection.' },
      { url: fit2Url,  name: 'Urban Style',    category: 'new',       price: 150, description: 'Modern urban style for everyday wear.' },
      { url: fit3Url,  name: 'Exclusive Look', category: 'new',       price: 180, description: 'Exclusive piece from our limited edition.' },
      { url: coatUrl,  name: 'Classic Coat',   category: 'Outerwear', price: 280, description: 'Timeless classic coat for all seasons.' },
      { url: dressUrl, name: 'Formal Dress',   category: 'Apparel',   price: 220, description: 'Elegant formal dress for special occasions.' },
      { url: suitUrl,  name: 'Classic Suit',   category: 'Suits',     price: 380, description: 'Sharp tailored suit with a refined finish.' },
    ];

    setSeeding(true);
    try {
      for (const item of items) {
        const resp = await fetch(item.url);
        const blob = await resp.blob();
        const ext  = item.url.split('.').pop();
        const file = new File([blob], `${item.name.replace(/\s+/g, '_')}.${ext}`, { type: blob.type });
        const { url } = await adminApi.uploadImage(file);
        await adminApi.saveProduct(null, {
          name: item.name, category: item.category,
          price: item.price, description: item.description,
          image: url, stockCount: 20,
          sizes: ['S', 'M', 'L', 'XL'], colors: ['#000000'],
        });
      }
      setSeedDone(true);
      await loadProducts();
    } catch (err) {
      alert('Seed error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // فلترة المنتجات بالبحث
  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // إحصائيات سريعة
  const totalInventory = products.reduce((s, p) => s + (p.stockCount || 0), 0);
  const active         = products.filter(p => p.stockCount > 0).length;
  const lowStock       = products.filter(p => p.stockCount > 0 && p.stockCount <= 5).length;
  const categories     = new Set(products.map(p => p.category)).size;

  const statusBadge = (count) => {
    if (count > 5)  return <span className="text-[10px] font-bold text-green-600">✦ In Stock ({count})</span>;
    if (count > 0)  return <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><AlertTriangle size={10} /> Low Stock ({count})</span>;
    return               <span className="text-[10px] font-bold text-red-500">✦ Out of Stock</span>;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      <Sidebar active="Products" />

      {/* Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSuccess={loadProducts} // بعد الإضافة تجلب المنتجات من جديد
        />
      )}

      <main className="flex-grow overflow-auto">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2 w-64">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-700 p-2 transition-colors"><Settings size={18} /></button>
          </div>
        </div>

        <div className="p-8">
          {/* Page Title */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Inventory Management</p>
              <h1 className="text-3xl font-serif text-gray-900">Product Collection</h1>
              <p className="text-sm text-gray-400 mt-1 max-w-md">
                Curation of the seasons most exclusive pieces. Review stock levels, pricing tiers, and editorial placement.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={seedHomeCards}
                disabled={seeding || seedDone}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-50"
              >
                <Upload size={14} />
                {seeding ? 'Seeding...' : seedDone ? 'Seeded ✓' : 'Seed Home Cards'}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                <Plus size={14} /> Add New Product
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Inventory', value: totalInventory.toLocaleString(), color: 'text-gray-900' },
              { label: 'Active Listings', value: active.toLocaleString(),         color: 'text-gray-900' },
              { label: 'Low Stock Alert', value: lowStock,                        color: 'text-red-500', extra: 'items' },
              { label: 'Category Spread', value: categories,                      color: 'text-gray-900', extra: 'cats.' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>
                  {s.value}
                  {s.extra && <span className="text-xs font-normal text-gray-400 ml-1">{s.extra}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Products Table */}
          <div className="bg-white border border-gray-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100">
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-6 py-4">Product Detail</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 text-sm">Loading products...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 text-sm">No products found.</td>
                  </tr>
                ) : filtered.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                    {/* صورة واسم المنتج */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.image
                            ? <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gray-200" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">SKU: {String(product._id || product.id).slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>

                    {/* الفئة */}
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category || '—'}</td>

                    {/* السعر */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${(product.price || 0).toLocaleString()}
                    </td>

                    {/* حالة المخزون */}
                    <td className="px-6 py-4">
                      {statusBadge(product.stockCount ?? 10)}
                    </td>

                    {/* أزرار التحكم */}
                    <td className="px-6 py-4">
                      <button className="text-gray-300 hover:text-gray-700 transition-colors p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Showing 1–{filtered.length} of {filtered.length} products
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3].map(n => (
                    <button key={n} className={`w-7 h-7 text-xs font-bold ${n === 1 ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-100 transition-colors'}`}>
                      {n}
                    </button>
                  ))}
                  <button className="w-7 h-7 text-xs text-gray-400 hover:bg-gray-100 transition-colors">›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;
