import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h2 className="text-white text-2xl font-black tracking-widest uppercase mb-3">VibeThread</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Thời trang hiện đại, chất lượng cao — Phong cách của bạn, câu chuyện của chúng tôi.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: shopweb@example.com</li>
              <li>Điện thoại: +84 123 456 789</li>
              <li>Địa chỉ: 123 Đường ABC, Hà Nội</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Đơn hàng của tôi</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Hồ sơ cá nhân</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Giỏ hàng</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Theo Dõi Chúng Tôi</h3>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition text-white text-sm font-bold">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-pink-500 transition text-white text-sm font-bold">in</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-sky-500 transition text-white text-sm font-bold">tw</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} VibeThread. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;