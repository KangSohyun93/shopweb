import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Form submitted with query:', searchQuery);
    if (!searchQuery.trim()) {
      console.log('Search query is empty, skipping navigation');
      alert('Vui lòng nhập từ khóa tìm kiếm!'); // Thông báo cho người dùng
      return;
    }

    const encodedQuery = encodeURIComponent(searchQuery);
    console.log('Navigating to:', `/search?q=${encodedQuery}`);
    navigate(`/search?q=${encodedQuery}`);
    setSearchQuery(''); // Xóa input sau khi tìm kiếm
  };

  return (
    <nav className="bg-gray-800 p-4 fixed top-0 left-0 w-full z-50 shadow">
      <div className="container mx-auto flex justify-center items-center gap-36">
        {/* Logo hoặc Brand */}
        <Link to="/" className="text-white text-xl font-bold">
          ShopWeb
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-40 sm:w-56 px-3 py-1 rounded-l-full bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600 focus:ring-2 focus:ring-blue-400 border-none transition-all duration-200 shadow"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-gray-700 px-4 py-1.5 rounded-r-full hover:bg-gray-600 text-white font-semibold shadow transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </button>
        </form>

        {/* Navigation Links */}
        <div className="space-x-14 flex items-center">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          <Link to="/cart" className="text-white hover:text-gray-300">Cart</Link>
          {isLoggedIn && (
            <Link to="/orders" className="text-white hover:text-gray-300">Orders</Link>
          )}
          {isAdmin && (
            <Link to="/admin/orders" className="text-white hover:text-gray-300">Admin Orders</Link>
          )}
          {!isLoggedIn && (
            <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="text-white hover:text-gray-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;