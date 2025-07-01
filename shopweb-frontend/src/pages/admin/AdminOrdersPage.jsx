import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllAdminOrders, updateOrderStatus } from '../../services/api';

const StatusUpdater = ({ order, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const statusStyles = {
        pending: 'border-yellow-500 text-yellow-800',
        processing: 'border-orange-500 text-orange-800',
        shipped: 'border-blue-500 text-blue-800',
        delivered: 'border-green-500 text-green-800',
        cancelled: 'border-red-500 text-red-800',
        unknown: 'border-gray-300 text-gray-800'
    };

    const statusOptions = [
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'processing', label: 'Đang chuẩn bị' },
        { value: 'shipped', label: 'Đang giao' },
        { value: 'delivered', label: 'Hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' },
    ];

    const handleSelectChange = async (e) => {
        const newStatus = e.target.value;
        setIsUpdating(true);
        setError('');

        try {
            const updatedOrder = await updateOrderStatus(order.order_id, newStatus);
            onStatusChange(updatedOrder.data);
            setCurrentStatus(updatedOrder.data.status);
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Lỗi!');
            e.target.value = currentStatus;
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <select
                value={currentStatus}
                onChange={handleSelectChange}
                disabled={isUpdating}
                className={`w-full p-2 border-2 rounded-md text-xs font-semibold appearance-none focus:ring-2 focus:ring-offset-1
                    ${statusStyles[currentStatus] || statusStyles.unknown}
                    ${isUpdating ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
                `}
            >
                {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {isUpdating && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">...</span>}
            {error && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500">{error}</span>}
        </div>
    );
};


const AdminOrdersPage = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xử lý' },
        { key: 'processing', label: 'Đang chuẩn bị' },
        { key: 'shipped', label: 'Đang giao' },
        { key: 'delivered', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getAllAdminOrders();
                setAllOrders(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                setError('Không thể tải danh sách đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredOrders(allOrders);
        } else {
            setFilteredOrders(allOrders.filter(order => order.status === activeTab));
        }
    }, [activeTab, allOrders]);

    const getCount = (status) => {
        if (status === 'all') return allOrders.length;
        return allOrders.filter(order => order.status === status).length;
    };

    const handleOrderUpdate = (updatedOrder) => {
        setAllOrders(prevOrders => 
            prevOrders.map(order => 
                order.order_id === updatedOrder.order_id ? updatedOrder : order
            )
        );
    };

    if (loading) return <p className="text-center py-10">Đang tải dữ liệu đơn hàng...</p>;
    if (error) return <p className="text-center py-10 text-red-600">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quản lý Đơn hàng</h2>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {tab.label}
                            {getCount(tab.key) > 0 && <span className={`ml-2 text-xs font-semibold py-0.5 px-2 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{getCount(tab.key)}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            {/* SỬA LẠI HEADER CHO CỘT TRẠNG THÁI */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Trạng thái</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Không có đơn hàng trong mục này.</td></tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.order_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username || order.user_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">{Number(order.total_amount).toLocaleString('vi-VN')} VND</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusUpdater order={order} onStatusChange={handleOrderUpdate} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/orders/${order.order_id}`} className="text-blue-600 hover:text-blue-900">Chi tiết</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdersPage;