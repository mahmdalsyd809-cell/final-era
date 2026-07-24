import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { WishlistProvider } from './context/WishlistContext'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Login from './pages/Login'
import ProductListing from './pages/ProductListing'
import ProductDetails from './pages/ProductDetails'
import RandomProduct from './pages/RandomProduct'
import Reviews from './pages/Reviews'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Dashboard from './pages/Dashboard'
import AdminProducts from './pages/AdminProducts'
import AdminCustomers from './pages/AdminCustomers'
import AdminOrders from './pages/AdminOrders'
import Layout from './components/Layout'
import GuestOverlay from './components/GuestOverlay'

const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = !!localStorage.getItem('tokenAdmin');
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/shop" element={<ProductListing />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/product/random" element={<RandomProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedAdminRoute><AdminCustomers /></ProtectedAdminRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <GuestOverlay />
              <AnimatedRoutes />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
