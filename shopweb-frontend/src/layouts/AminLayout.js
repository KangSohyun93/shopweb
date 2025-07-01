import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }

    try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
    } catch (error) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-layout bg-gray-100 min-h-screen">
            <AdminNavbar />
            <main className="flex-1 pt-20">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;