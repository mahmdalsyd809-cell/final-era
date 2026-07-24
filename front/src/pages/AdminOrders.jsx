import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Settings, Menu, X, Check
} from 'lucide-react';
import { adminApi } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { createPortal } from 'react-dom';

// ====== Modal تحديث حالة الطلب ======
const UpdateStatusModal = ({ order, onClose, onSuccess }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateOrder(order._id || order.id, { status });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error updating order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm shadow-2xl rounded-sm relative">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-serif text-gray-900">Update Order Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Order ID: #{String(order?._id || order?.id).slice(-8).toUpperCase()}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-60">
              <Check size={14} /> {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ====== الصفحة الرئيسية لإدارة الطلبات ======
const AdminOrders = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    delivered:  'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped:    'bg-blue-100 text-blue-700',
    pending:    'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex relative">
      <AdminSidebar active="Orders" isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {selectedOrder && (
        <UpdateStatusModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onSuccess={loadOrders} 
        />
      )}

      <main className="flex-grow overflow-auto h-screen w-full">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 lg:px-8 py-4 flex items-center justify-between">
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
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full placeholder-gray-400"
              />
            </div>
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
          <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
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
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                      >
                        Update Status
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
