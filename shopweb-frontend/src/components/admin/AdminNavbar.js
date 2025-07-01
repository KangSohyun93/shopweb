import { NavLink, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const linkClass = ({ isActive }) => 
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <nav className="bg-gray-800 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-white text-xl">Admin Panel</span>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
                                <NavLink to="/admin/orders" className={linkClass}>Đơn hàng</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
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
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;