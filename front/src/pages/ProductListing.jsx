import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import coatImg from '../assets/coat.png';
import suitImg from '../assets/suit.png';
import { Filter, ChevronDown } from 'lucide-react';
import { storeApi, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // للأنيميشن بتاع الفلاتر
  const [isCatOpen, setIsCatOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('جاري جلب قائمة المنتجات...');
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSize) params.size = selectedSize;
        if (sortBy) params.sort = sortBy;
        params.page = page;

        const data = await storeApi.getProducts(params);
        let raw = data.products || data || [];

        // client-side sort (backend may not support sorting)
        if (sortBy === 'price_asc')  raw = [...raw].sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') raw = [...raw].sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating')     raw = [...raw].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else raw = [...raw].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); // newest first

        setProducts(raw);
        if (data.pages) setTotalPages(data.pages);
      } catch (error) {
        console.error('حدث خطأ في جلب المنتجات:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSize, sortBy, page]);

  const handleProductClick = useCallback((e, productId) => {
    if (isLoggedIn) {
      navigate(`/product/${productId}`);
      return;
    }
    // Guest — show overlay with arrow
    e.preventDefault();
    window.dispatchEvent(new Event('show-guest-overlay'));
  }, [isLoggedIn, navigate]);

  return (
    <Layout>
      <div className="bg-white min-h-screen">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 border-b border-gray-100">
          <h1 className="text-4xl font-serif mb-4">Shop All</h1>
          <p className="text-gray-500 max-w-2xl">
            Explore our curated selection of high-quality garments, designed for those who appreciate the finer details.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 flex items-center">
                    <Filter size={14} className="mr-2" /> Filters
                  </h3>
                  <div className="space-y-4">
                    {/* Categories Filter */}
                    <div className="border-b border-gray-100 pb-2">
                      <button 
                        onClick={() => setIsCatOpen(!isCatOpen)}
                        className="flex justify-between items-center w-full cursor-pointer text-sm font-medium py-2 hover:text-primary transition-colors"
                      >
                        Categories <ChevronDown size={14} className={`transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ease-in-out ${isCatOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <ul className="pl-2 pt-2 pb-4 space-y-2 text-sm text-gray-500">
                                            {[
                              { label: 'All Products', value: '' },
                              { label: 'New',          value: 'new' },
                              { label: 'Men',          value: 'Men' },
                              { label: 'Women',        value: 'Women' },
                              { label: 'Accessories',  value: 'Accessories' },
                              { label: 'Outerwear',    value: 'Outerwear' },
                              { label: 'Suits',        value: 'Suits' },
                              { label: 'Knitwear',     value: 'Knitwear' },
                            ].map(({ label, value }) => (
                              <li key={value}>
                                <label className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                                  <input
                                    type="radio"
                                    name="cat"
                                    checked={selectedCategory === value}
                                    onChange={() => {
                                      setSelectedCategory(value);
                                      setPage(1);
                                      setSearchParams(value ? { category: value } : {});
                                    }}
                                    className="accent-primary"
                                  />
                                  <span>{label}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Size Filter */}
                    <div className="border-b border-gray-100 pb-2">
                      <button 
                        onClick={() => setIsSizeOpen(!isSizeOpen)}
                        className="flex justify-between items-center w-full cursor-pointer text-sm font-medium py-2 hover:text-primary transition-colors"
                      >
                        Size <ChevronDown size={14} className={`transition-transform duration-300 ${isSizeOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ease-in-out ${isSizeOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div className="grid grid-cols-3 gap-2 pt-2 pb-4">
                            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                              <button 
                                key={size} 
                                onClick={() => { setSelectedSize(selectedSize === size ? '' : size); setPage(1); }}
                                className={`border py-2 text-xs transition-colors uppercase ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary'}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs text-gray-400 uppercase tracking-widest">{products.length} Products</span>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-900 cursor-pointer relative group z-20">
                  <span className="flex items-center">Sort By <ChevronDown size={14} className="ml-2" /></span>
                  {/* Sort Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button onClick={() => { setSortBy('newest'); setPage(1); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${sortBy === 'newest' ? 'text-primary' : ''}`}>Newest</button>
                    <button onClick={() => { setSortBy('price_asc'); setPage(1); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${sortBy === 'price_asc' ? 'text-primary' : ''}`}>Price: Low to High</button>
                    <button onClick={() => { setSortBy('price_desc'); setPage(1); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${sortBy === 'price_desc' ? 'text-primary' : ''}`}>Price: High to Low</button>
                    <button onClick={() => { setSortBy('rating'); setPage(1); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${sortBy === 'rating' ? 'text-primary' : ''}`}>Top Rated</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {loading ? (
                  <p className="col-span-full text-center text-gray-500 py-10">جاري تحميل المنتجات...</p>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product._id || product.id}
                      className="group cursor-pointer block"
                      onClick={(e) => handleProductClick(e, product._id || product.id)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6">
                        <img 
                          src={getImageUrl(product.image) || (product.id % 2 === 0 ? suitImg : coatImg)} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                      <p className="text-sm font-bold text-primary">${(product.price || 0).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-10">No Products Found</p>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 flex items-center justify-center border text-xs font-bold transition-colors ${
                        page === pageNum
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-primary text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductListing;
