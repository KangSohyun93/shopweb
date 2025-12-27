import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/api';

const OrdersPage = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xác nhận' },
        { key: 'processing', label: 'Đang chuẩn bị' },
        { key: 'shipped', label: 'Đang giao' },
        { key: 'delivered', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrders();
                const data = (response.data || []).map(order => ({ ...order, items: order.items || [] }));
                setAllOrders(data);
                setFilteredOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
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
    
    const statusLabels = {
        pending: { text: 'Chờ xác nhận', color: 'text-yellow-600' },
        processing: { text: 'Đang chuẩn bị', color: 'text-orange-600' },
        shipped: { text: 'Đang giao hàng', color: 'text-blue-600' },
        delivered: { text: 'Hoàn thành', color: 'text-green-600' },
        cancelled: { text: 'Đã hủy', color: 'text-red-600' },
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto py-8 px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Quản lý đơn hàng</h2>

                <div className="bg-white rounded-t-lg shadow-md overflow-x-auto">
                    <nav className="flex border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 md:px-6 py-3 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-200 ${activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-4 pt-4">
                    {loading ? (
                        <p className="text-center py-10">Đang tải...</p>
                    ) : error ? (
                        <p className="text-center py-10 text-red-600">{error}</p>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center bg-white py-16 rounded-b-lg shadow-md">
                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/5fafbb923393b712b96488590b8f781f.png" alt="Không có đơn hàng" className="w-24 h-24 mx-auto mb-4" />
                            <p className="text-gray-500">Chưa có đơn hàng</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
        const hasItems = order.items && order.items.length > 0;
        const representativeItem = hasItems ? order.items[0] : null;
        const otherItemsCount = hasItems ? order.items.length - 1 : 0;
        const displayImageUrl = representativeItem?.primary_image_url || representativeItem?.image_url || 'https://placehold.co/80';

        return (
            <div key={order.order_id} className="bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mã đơn: #{order.order_id}</span>
                    <span className={`font-semibold text-sm uppercase ${statusLabels[order.status]?.color || 'text-gray-700'}`}>
                        {statusLabels[order.status]?.text || 'Không xác định'}
                    </span>
                </div>
                
                {hasItems && (
                    <Link to={`/orders/${order.order_id}`} className="block hover:bg-gray-50 transition-colors">
                        <div className="p-4 flex items-center gap-4">
                            <img 
                                src={displayImageUrl} 
                                alt={representativeItem.product_name} 
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 line-clamp-1">{representativeItem.product_name}</p>
                                
                                <p className="text-sm text-gray-500">Size: {representativeItem.size || 'N/A'}</p>

                                {otherItemsCount > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">và {otherItemsCount} sản phẩm khác</p>
                                )}
                            </div>
                        </div>
                    </Link>
                )}

                <div className="p-4 bg-gray-50 rounded-b-lg flex flex-col md:flex-row justify-end items-center gap-4 text-right">
                    <p className="text-lg">
                        Thành tiền: <span className="font-bold text-red-600">{Number(order.total_amount).toLocaleString('vi-VN')} VND</span>
                    </p>
                    <Link to={`/orders/${order.order_id}`} className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold shadow hover:bg-blue-700 transition">
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        );
    })
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;