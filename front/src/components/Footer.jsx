import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          <div className="space-y-4 pr-8">
            <h3 className="text-2xl font-serif font-bold tracking-[0.2em] text-gray-900">AEIRA</h3>
            <p className="text-[11px] uppercase tracking-widest text-gray-500 leading-relaxed font-sans">
              A series of exclusive wear on the essence the art of everything we wanted right now.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-6 font-sans">Explore More</p>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500 font-sans">
              <li><Link to="/shop" className="hover:text-gray-900 transition-colors">Shop All</Link></li>
              <li><Link to="/shop?category=Outerwear" className="hover:text-gray-900 transition-colors">Outerwear</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-gray-900 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-6 font-sans">Customer</p>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500 font-sans">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Accessibility</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-6 font-sans">Follow Us</p>
            <ul className="flex flex-col gap-4 text-[10px] uppercase tracking-widest text-gray-500 font-sans">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Twitter</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">
            COPYRIGHT {new Date().getFullYear()} AEIRA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
