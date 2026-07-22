import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  Settings, LogOut, Search, MoreVertical, Store
} from 'lucide-react';
import { adminApi, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0 hidden lg:flex min-h-screen">
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
      <div className="p-4 border-t border-white/10 mt-auto">
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

// ====== الصفحة الرئيسية لإدارة الطلبات ======
const AdminOrders = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error('خطأ في جلب الطلبات:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // فلترة الطلبات بالبحث
  const filtered = orders.filter(o =>
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(o._id || o.id).toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    Delivered:  'bg-green-100 text-green-700',
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped:    'bg-blue-100 text-blue-700',
    pending:    'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      <Sidebar active="Orders" />

      <main className="flex-grow overflow-auto h-screen">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2 w-64">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search orders (ID, Name, Email)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-8">
          {/* Page Title */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Management</p>
            <h1 className="text-3xl font-serif text-gray-900">Orders</h1>
            <p className="text-sm text-gray-400 mt-1 max-w-md">
              Review and manage all customer orders in the system.
            </p>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-sm">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100">
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-gray-400 text-sm">Loading orders...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-gray-400 text-sm">No orders found.</td>
                  </tr>
                ) : filtered.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">#{String(order._id || order.id).slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{order.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
              <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-t border-gray-100 rounded-b-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Showing {filtered.length} orders
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
