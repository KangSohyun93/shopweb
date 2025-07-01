import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, cancelOrder } from '../../services/api'; 

const OrderStatusTimeline = ({ currentStatus }) => {
    const steps = [
        { key: 'pending', label: 'Chờ xử lý' },
        { key: 'processing', label: 'Chuẩn bị' },
        { key: 'shipped', label: 'Đang giao' },
        { key: 'delivered', label: 'Đã nhận' }
    ];
    if (currentStatus === 'cancelled') {
        return <p className="text-center font-semibold text-red-600 bg-red-100 p-3 rounded-md">Đơn hàng đã bị hủy.</p>;
    }
    const statusIndex = steps.findIndex(step => step.key === currentStatus);
    return (
        <div className="flex justify-between items-start relative pt-4">
            {steps.map((step, index) => (
                <div key={step.key} className="flex-1 text-center relative z-10">
                    <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-1 border-2 border-white shadow-md ${index <= statusIndex ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        {index < statusIndex ? '✓' : ''}
                    </div>
                    <p className={`text-xs mt-1 ${index <= statusIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{step.label}</p>
                </div>
            ))}
            <div className="absolute top-8 left-0 w-full h-1 -z-0">
                <div className="bg-gray-300 w-full h-full absolute"></div>
                <div className="bg-blue-600 h-full absolute transition-all duration-500" style={{ width: `${statusIndex >= 0 ? (statusIndex / (steps.length - 1)) * 100 : 0}%` }}></div>
            </div>
        </div>
    );
};


const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await getOrderDetails(id);
            setOrder(response.data);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Không thể tải chi tiết đơn hàng hoặc bạn không có quyền truy cập.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (id) {
           fetchOrder();
        }
    }, [id]);
    
    const handleCancelOrder = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.')) {
            return;
        }
        setIsCancelling(true);
        setError(null);
        try {
            const response = await cancelOrder(order.order_id);
            alert('Đã hủy đơn hàng thành công!');
            setOrder(response.data); 
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsCancelling(false);
        }
    };

    const calculateSubtotal = () => !order ? 0 : order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotal = calculateSubtotal();
    const discountAmount = order ? subtotal - order.total_amount : 0;

    if (loading) return <p className="text-center py-10">Đang tải...</p>;
    if (error) return <p className="text-center py-10 text-red-600 bg-red-100 p-4 rounded">{error}</p>;
    if (!order) return <p className="text-center py-10">Không tìm thấy đơn hàng.</p>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng #{order.order_id}</h2>
                    <Link to="/orders" className="flex items-center gap-2 text-blue-600 hover:underline">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Sản phẩm trong đơn</h3>
                            {order.items.map(item => (
                                <div key={item.order_item_id} className="flex items-start justify-between border-b py-4 last:border-b-0">
                                    <div className="flex items-start flex-grow">
                                        <Link to={`/products/${item.product_id}`}>
                                            <img 
                                                src={item.primary_image_url || 'https://placehold.co/80'} 
                                                alt={item.product_name} 
                                                className="w-24 h-24 rounded-md object-cover mr-4 hover:opacity-80 transition-opacity"
                                            />
                                        </Link>
                                        <div>
                                            <Link to={`/products/${item.product_id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                                {item.product_name}
                                            </Link>
                                            
                                            <p className="text-sm text-gray-500">Phân loại: Size {item.size || 'N/A'}</p>
                                            
                                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-right min-w-[120px]">{(item.price * item.quantity).toLocaleString('vi-VN')} VND</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h3 className="text-xl font-semibold mb-4">Trạng thái</h3>
                             <OrderStatusTimeline currentStatus={order.status} />
                             <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                                 <p>Đặt hàng lúc: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                                 <p>Cập nhật lúc: {new Date(order.updated_at).toLocaleString('vi-VN')}</p>
                             </div>
                        </div>

                        {(order.status === 'pending' || order.status === 'processing') && (
                             <div className="bg-white p-6 rounded-lg shadow-md">
                                 <h3 className="text-xl font-semibold mb-4">Hành động</h3>
                                 <button
                                     onClick={handleCancelOrder}
                                     disabled={isCancelling}
                                     className="w-full bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                                 </button>
                             </div>
                        )}
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Thông tin giao hàng</h3>
                            <div className="space-y-1 text-gray-700">
                                <p><strong>Người nhận:</strong> {order.recipient_name}</p>
                                <p><strong>Điện thoại:</strong> {order.phone}</p>
                                <p><strong>Địa chỉ:</strong> {`${order.street}, ${order.city}, ${order.country}`}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h3 className="text-xl font-semibold mb-4">Tóm tắt thanh toán</h3>
                             <div className="space-y-2 text-gray-700">
                                <div className="flex justify-between"><span>Tạm tính:</span><span>{subtotal.toLocaleString('vi-VN')} VND</span></div>
                                {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá ({order.promotion_code}):</span><span>- {discountAmount.toLocaleString('vi-VN')} VND</span></div>}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><span>Tổng cộng:</span><span className="text-red-600">{order.total_amount.toLocaleString('vi-VN')} VND</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;