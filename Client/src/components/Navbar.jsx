import React, { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        const categoriesData = res.data || [];
        setAllCategories(categoriesData);
        // Lấy 3 danh mục Cha vừa tạo bằng script
        const parents = categoriesData.filter(cat => !cat.parent_id);
        setParentCategories(parents);
        
        // Debug log
        console.log('🔧 NAVBAR - Categories loaded:');
        console.log('  Total:', categoriesData.length);
        console.log('  Parents:', parents.length, parents.map(c => ({ id: c.category_id, name: c.name })));
        parents.forEach(p => {
          const children = categoriesData.filter(c => c.parent_id === p.category_id);
          console.log(`    ${p.name}: ${children.length} children`);
        });
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const getChildCategories = (parentId) => {
    return allCategories.filter(cat => cat.parent_id === parentId);
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50 shadow-sm flex flex-col">
      <div className="bg-gray-100 text-center py-1.5 text-xs text-gray-600 tracking-wide uppercase font-medium">
        Miễn phí vận chuyển cho đơn hàng trên 500.000đ
      </div>

      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-red-600 text-3xl font-extrabold tracking-tighter">H&M Style</Link>
        </div>

        {/* MEGA MENU: ÁO | QUẦN & VÁY | KHÁC */}
        <div className="hidden md:flex space-x-12 h-full items-center">
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
                  className="text-sm font-bold text-gray-800 hover:text-red-600 uppercase tracking-widest px-2 py-5 border-b-2 border-transparent group-hover:border-red-600 transition duration-200"
                >
                  {parent.name}
                </Link>

                {/* Dropdown Menu thả xuống (Chia thành 2 cột cho đẹp vì Áo/Quần có nhiều loại) */}
                {activeMenu === parent.category_id && children.length > 0 && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-[400px] bg-white border border-gray-100 shadow-xl p-6 rounded-b-md">
                    <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
                      {children.map(child => (
                        <li key={child.category_id}>
                          <Link 
                            to={`/category/${child.category_id}`}
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

        {/* ICON BÊN PHẢI */}
        <div className="flex items-center space-x-6">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm" className="bg-transparent border-none outline-none text-sm w-24 focus:w-40 transition-all ml-2"/>
          </form>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="group relative py-4">
                <button className="text-gray-800 hover:text-red-600 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></button>
                <div className="absolute right-0 top-full w-40 bg-white border border-gray-100 rounded shadow-lg hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Hồ sơ</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Đơn hàng</Link>
                  {isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-50">Admin Panel</Link>}
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t">Đăng xuất</button>
                </div>
              </div>
            ) : (<Link to="/login" className="text-gray-800 hover:text-red-600 text-sm font-medium">Đăng nhập</Link>)}
            <Link to="/cart" className="text-gray-800 hover:text-red-600 relative"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
