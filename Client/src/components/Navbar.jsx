import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [parentCategories, setParentCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        const categoriesData = res.data || [];
        setAllCategories(categoriesData);
        const parents = categoriesData.filter(cat => !cat.parent_id);
        setParentCategories(parents);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const getChildCategories = (parentId) =>
    allCategories.filter(cat => cat.parent_id === parentId);

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50 shadow-sm">
      {/* ── MAIN BAR ── */}
      <div className="container mx-auto px-4 flex justify-between items-center h-14 md:h-16">

        {/* Hamburger (mobile/tablet) */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded hover:bg-gray-100 transition"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-black text-2xl md:text-3xl font-black tracking-widest uppercase hover:text-red-600 transition">
            VibeThread
          </Link>
        </div>

        {/* DESKTOP MEGA MENU */}
        <div className="hidden md:flex space-x-8 lg:space-x-12 h-full items-center">
          {parentCategories.map((parent) => {
            const children = getChildCategories(parent.category_id);
            return (
              <div
                key={parent.category_id}
                className="h-full flex items-center relative group"
                onMouseEnter={() => setActiveMenu(parent.category_id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  to={`/category/${parent.category_id}`}
                  className="text-xs lg:text-sm font-bold text-gray-800 hover:text-red-600 uppercase tracking-widest px-2 py-5 border-b-2 border-transparent group-hover:border-red-600 transition duration-200"
                >
                  {parent.name}
                </Link>
                {activeMenu === parent.category_id && children.length > 0 && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-[400px] bg-white border border-gray-100 shadow-xl p-6 rounded-b-md">
                    <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
                      {children.map(child => (
                        <li key={child.category_id}>
                          <Link
                            to={`/category/${child.category_id}`}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm text-gray-600 hover:text-red-600 hover:font-medium transition block"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6">
          {/* Search — desktop always visible, mobile toggle */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="bg-transparent border-none outline-none text-sm w-24 focus:w-40 transition-all ml-2"
            />
          </form>

          {/* Search icon for tablet/mobile */}
          <button
            className="lg:hidden text-gray-800 hover:text-red-600 transition"
            onClick={() => setSearchOpen(o => !o)}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* User / Auth */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="group relative py-4">
                <button className="text-gray-800 hover:text-red-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full w-44 bg-white border border-gray-100 rounded shadow-lg hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Hồ sơ</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Đơn hàng</Link>
                  {isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-50">Admin Panel</Link>}
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-800 hover:text-red-600 text-sm font-medium hidden sm:block">Đăng nhập</Link>
            )}
            <Link to="/cart" className="text-gray-800 hover:text-red-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE SEARCH BAR (tablet/mobile) ── */}
      {searchOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-2 bg-white">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="bg-transparent border-none outline-none text-sm flex-1 ml-2"
            />
          </form>
        </div>
      )}

      {/* ── MOBILE DRAWER MENU ── */}
      {mobileOpen && (
        <div ref={mobileRef} className="md:hidden border-t border-gray-100 bg-white shadow-lg max-h-[75vh] overflow-y-auto">
          {/* Login link if not logged in (mobile) */}
          {!isLoggedIn && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-red-600 border-b border-gray-100"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}

          {/* Categories */}
          {parentCategories.map((parent) => {
            const children = getChildCategories(parent.category_id);
            const isExpanded = mobileExpanded === parent.category_id;
            return (
              <div key={parent.category_id} className="border-b border-gray-100">
                <div className="flex items-center">
                  <Link
                    to={`/category/${parent.category_id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-5 py-4 text-sm font-bold uppercase tracking-wider text-gray-800"
                  >
                    {parent.name}
                  </Link>
                  {children.length > 0 && (
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : parent.category_id)}
                      className="px-4 py-4 text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
                {isExpanded && children.length > 0 && (
                  <div className="bg-gray-50 px-5 pb-3 grid grid-cols-2 gap-2">
                    {children.map(child => (
                      <Link
                        key={child.category_id}
                        to={`/category/${child.category_id}`}
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-sm text-gray-600 hover:text-red-600 transition"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* User links if logged in */}
          {isLoggedIn && (
            <div className="border-t border-gray-200 bg-gray-50">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-5 py-3 text-sm text-gray-700">Hồ sơ</Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-5 py-3 text-sm text-gray-700">Đơn hàng của tôi</Link>
              {isAdmin && <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-5 py-3 text-sm text-red-600 font-semibold">Admin Panel</Link>}
              <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="block w-full text-left px-5 py-3 text-sm text-gray-700 border-t border-gray-200"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
