import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const linkClass = ({ isActive }) => 
        `px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    const mobileLinkClass = ({ isActive }) => 
        `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <nav className="bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center">
                        <span className="font-bold text-white text-xl">Admin Panel</span>
                        <div className="hidden lg:block ml-10">
                            <div className="flex items-baseline space-x-2">
                                <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
                                <NavLink to="/admin/orders" className={linkClass}>Đơn hàng</NavLink>
                                <NavLink to="/admin/users" className={linkClass}>Người dùng</NavLink>
                                <NavLink to="/admin/banners" className={linkClass}>Banner</NavLink>
                                <NavLink to="/admin/chat" className={linkClass}>Chat</NavLink>
                                <NavLink to="/admin/ai-rules" className={linkClass}>Cấu hình gợi ý</NavLink>
                            </div>
                        </div>
                    </div>
                    
                    {/* Desktop Right Actions */}
                    <div className="hidden lg:flex items-center">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium mr-4">
                           Xem Shop
                        </a>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-700"
                        >
                            Đăng xuất
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium mr-2">
                           Shop
                        </a>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-gray-800 border-t border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Dashboard</NavLink>
                        <NavLink to="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Đơn hàng</NavLink>
                        <NavLink to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Người dùng</NavLink>
                        <NavLink to="/admin/banners" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Banner</NavLink>
                        <NavLink to="/admin/chat" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Chat</NavLink>
                        <NavLink to="/admin/ai-rules" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Cấu hình gợi ý</NavLink>
                        
                        <div className="pt-2 border-t border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-white"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AdminNavbar;