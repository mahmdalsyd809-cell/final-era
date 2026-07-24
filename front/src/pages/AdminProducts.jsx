import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BarChart2, Settings, LogOut, Plus, Search,
  MoreVertical, AlertTriangle, Upload, X, Store, Menu, Edit2
} from 'lucide-react';
import { adminApi, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import fit1Url   from '../assets/fit1.jpg';
import fit2Url   from '../assets/fit2.jpg';
import fit3Url   from '../assets/fit3.jpg';
import coatUrl   from '../assets/coat.png';
import dressUrl  from '../assets/formal_dress.png';
import suitUrl   from '../assets/formal_suit.png';

// ====== Modal إضافة منتج جديد أو تعديله ======
const AddProductModal = ({ onClose, onSuccess, initialData = null }) => {
  const fileRef = useRef();
  const multiFileRef = useRef();
  
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [preview, setPreview]     = useState(initialData?.image ? getImageUrl(initialData.image) : null);
  const [imageFile, setImageFile] = useState(null);
  
  const [extraPreviews, setExtraPreviews] = useState(initialData?.images?.length ? initialData.images.map(getImageUrl) : []);
  const [extraFiles, setExtraFiles] = useState([]);
  
  const [colors, setColors] = useState(initialData?.colors || []);
  const [colorInput, setColorInput] = useState('#ffffff');
  
  const [form, setForm] = useState(initialData ? {
    name: initialData.name || '',
    category: initialData.category || 'Apparel',
    sku: String(initialData._id || initialData.id || ''),
    price: initialData.price || '',
    stockCount: initialData.stockCount || '',
    description: initialData.description || '',
    image: initialData.image || '',
    images: initialData.images || [],
  } : {
    name: '', category: 'Apparel', sku: '',
    price: '', stockCount: '', description: '', image: '', images: [],
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
    setPreview(URL.createObjectURL(file));
    setImageFile(file);
  };
  
  const handleExtraFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) alert('تم تجاهل بعض الصور بسبب الحجم');
    
    setExtraPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    setExtraFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeExtraImage = (index) => {
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
    if (index >= form.images.length) {
      setExtraFiles(prev => prev.filter((_, i) => i !== (index - form.images.length)));
    } else {
      setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }
  };
  
  const addColor = () => {
    if (!colors.includes(colorInput)) setColors([...colors, colorInput]);
  };
  const removeColor = (col) => setColors(colors.filter(c => c !== col));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image;
      
      if (imageFile) {
        setUploading(true);
        const uploadRes = await adminApi.uploadImage(imageFile);
        imageUrl = uploadRes.url;
      }
      
      let uploadedExtra = [];
      if (extraFiles.length > 0) {
        setUploading(true);
        for (const file of extraFiles) {
          const res = await adminApi.uploadImage(file);
          uploadedExtra.push(res.url);
        }
      }
      setUploading(false);
      
      const finalImages = [...form.images, ...uploadedExtra];

      await adminApi.saveProduct(initialData?._id || initialData?.id || null, {
        name:        form.name,
        category:    form.category,
        price:       Number(form.price),
        stockCount:  Number(form.stockCount),
        description: form.description,
        image:       imageUrl,
        images:      finalImages,
        sizes:       ['S','M','L','XL'],
        colors:      colors,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setUploading(false);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = ['Apparel', 'Homewear', 'Accessories', 'Footwear', 'Outerwear', 'Suits', 'Knitwear'];

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif text-gray-900">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
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

              {/* Colors Picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Colors (Hex)</label>
                <div className="flex items-center gap-3 mb-3">
                  <input 
                    type="color" 
                    value={colorInput} 
                    onChange={e => setColorInput(e.target.value)}
                    className="w-10 h-10 p-0 border-0 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={colorInput} 
                    onChange={e => setColorInput(e.target.value)}
                    className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors w-24 uppercase"
                  />
                  <button 
                    type="button" onClick={addColor}
                    className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map(col => (
                    <div key={col} className="flex items-center gap-1 border border-gray-200 px-2 py-1 rounded-sm">
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: col }} />
                      <span className="text-xs uppercase text-gray-600">{col}</span>
                      <button type="button" onClick={() => removeColor(col)} className="text-gray-400 hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* === العمود الأيمن: رفع الصورة === */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Main Image</label>
                <div
                  onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-sm aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <Upload size={28} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Main Image</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                {preview && (
                  <button type="button" onClick={() => { setPreview(null); setImageFile(null); setForm(p => ({...p, image:''})); }}
                    className="mt-2 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove main image
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Extra Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {extraPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square border border-gray-200 rounded-sm overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" alt="Extra" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => removeExtraImage(i)} className="text-white hover:text-red-400">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => multiFileRef.current.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Plus size={20} className="text-gray-300" />
                  </div>
                </div>
                <input ref={multiFileRef} type="file" accept="image/*" multiple onChange={handleExtraFiles} className="hidden" />
              </div>
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
              {initialData ? <Edit2 size={14} /> : <Plus size={14} />}
              {uploading ? 'Uploading Image...' : saving ? 'Saving...' : initialData ? 'Update Product' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ====== الصفحة الرئيسية لإدارة المنتجات ======
const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [seeding, setSeeding]     = useState(false);
  const [seedDone, setSeedDone]   = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startIdx = filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filtered.length);

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
    <div className="min-h-screen bg-[#F9F9F9] flex relative">
      <AdminSidebar active="Products" isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Modal */}
      {showModal && (
        <AddProductModal
          initialData={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSuccess={loadProducts} // بعد الإضافة تجلب المنتجات من جديد
        />
      )}

      <main className="flex-grow overflow-auto w-full">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile Menu Toggle & Search */}
          <div className="flex items-center gap-2 lg:gap-4 flex-grow">
            <button 
              className="lg:hidden text-gray-900 hover:text-gray-600 transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2 w-full max-w-md">
              <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder-gray-400"
            />
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {/* Page Title */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Inventory Management</p>
              <h1 className="text-2xl lg:text-3xl font-serif text-gray-900">Product Collection</h1>
              <p className="text-xs lg:text-sm text-gray-400 mt-1 max-w-md">
                Curation of the seasons most exclusive pieces. Review stock levels, pricing tiers, and editorial placement.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <button
                onClick={seedHomeCards}
                disabled={seeding || seedDone}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-50"
              >
                <Upload size={14} />
                {seeding ? 'Seeding...' : seedDone ? 'Seeded ✓' : 'Seed Home Cards'}
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowModal(true);
                }}
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
          <div className="bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
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
                ) : paginatedProducts.map((product) => (
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
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                          }}
                          className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              try {
                                await adminApi.deleteProduct(product._id || product.id);
                                loadProducts();
                              } catch (err) {
                                alert('Error deleting product');
                              }
                            }
                          }}
                          className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Showing {startIdx}–{endIdx} of {filtered.length} products
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button 
                      key={n} 
                      onClick={() => setCurrentPage(n)}
                      className={`w-7 h-7 text-xs font-bold ${n === currentPage ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-100 transition-colors'}`}>
                      {n}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 text-xs text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    ›
                  </button>
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
