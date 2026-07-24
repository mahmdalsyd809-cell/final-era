import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Store, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ active, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
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
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full hidden lg:flex'}`}>
        <div className="p-8 flex justify-between items-center border-b border-white/10 lg:border-none">
          <div>
            <Link to="/" className="text-2xl font-serif font-bold tracking-[0.2em]">AEIRA</Link>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Admin Panel</p>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
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
              {adminName?.[0] || 'A'}
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
    </>
  );
};

export default AdminSidebar;
