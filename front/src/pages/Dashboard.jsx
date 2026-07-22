import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, DollarSign, Store } from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userName, logout } = useAuth();

  const [stats, setStats]           = useState({ revenue: 0, ordersCount: 0, productsCount: 0, customersCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getOrders(),
        ]);
        if (statsData) setStats(statsData);
        setRecentOrders(ordersData.orders || ordersData || []);
      } catch (err) {
        console.error('خطأ في تحميل الداشبورد:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // تسجيل الخروج — يستخدم AuthContext (يمسح بيانات المستخدم فقط مش كل localStorage)
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { label: 'Revenue',   value: `$${(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'تحليلات كام order بل ارقام', value: (stats.ordersCount || 0).toLocaleString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/orders', linkLabel: 'View Orders' },
    { label: 'Products',  value: (stats.productsCount || 0).toLocaleString(),  icon: Package,    color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Customers', value: (stats.customersCount || 0).toLocaleString(), icon: Users,      color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const statusColor = {
    Delivered:  'bg-green-100 text-green-700',
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped:    'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-col hidden lg:flex">
        <div className="p-8">
          <Link to="/" className="text-2xl font-serif font-bold tracking-[0.2em]">AEIRA</Link>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-grow px-4 space-y-1 mt-4">
          {[
            { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders'    },
            { to: '/admin/products',  icon: Package,         label: 'Products'  },
            { to: '/admin/customers', icon: Users,           label: 'Customers' },
            { to: '/',                icon: Store,           label: 'Storefront' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
              <Icon size={18} /><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-medium text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow p-8 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {userName}.</p>
          </div>
        </header>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{card.value}</h3>
                </div>
              </div>
              {card.link && (
                <div className="pt-2 border-t border-gray-50">
                  <Link to={card.link} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors">
                    {card.linkLabel}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* جدول الطلبات الأخيرة */}
        <div className="bg-white shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No orders found.</td></tr>
                ) : recentOrders.slice(0, 5).map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{String(order._id || order.id).slice(-8)}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">${(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/orders`} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;
