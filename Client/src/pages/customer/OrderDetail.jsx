import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getOrderDetails, cancelOrder, createReview, updateReview, getUserReview, checkCanReturn, requestReturn } from '../../services/api'; 
import ReviewModal from '../../components/ReviewModal'; 

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
    
    if (currentStatus === 'return_requested') {
        return <p className="text-center font-semibold text-yellow-600 bg-yellow-100 p-3 rounded-md">🔄 Đang chờ xử lý yêu cầu trả hàng</p>;
    }
    
    if (currentStatus === 'returning') {
        return <p className="text-center font-semibold text-blue-600 bg-blue-100 p-3 rounded-md">📦 Đang hoàn hàng</p>;
    }
    
    if (currentStatus === 'refunded') {
        return <p className="text-center font-semibold text-green-600 bg-green-100 p-3 rounded-md">✅ Đã hoàn tiền</p>;
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
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productReviews, setProductReviews] = useState({});
    const [canReturn, setCanReturn] = useState({ canReturn: false, reason: '' });
    const [isRequestingReturn, setIsRequestingReturn] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getOrderDetails(id);
            setOrder(response.data);
            
            // Nếu đơn hàng đã hoàn thành, lấy reviews cho từng sản phẩm
            if (response.data.status === 'delivered') {
                const reviews = {};
                for (const item of response.data.items) {
                    try {
                        const reviewRes = await getUserReview(item.product_id, id);
                        if (reviewRes.data) {
                            reviews[item.product_id] = reviewRes.data;
                        }
                    } catch (err) {
                        // Sản phẩm chưa có review trong đơn hàng này
                        reviews[item.product_id] = null;
                    }
                }
                setProductReviews(reviews);
                
                // Kiểm tra có thể return không
                try {
                    const returnCheck = await checkCanReturn(id);
                    setCanReturn(returnCheck.data);
                } catch (err) {
                    console.error('Error checking return eligibility:', err);
                }
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Không thể tải chi tiết đơn hàng hoặc bạn không có quyền truy cập.');
        } finally {
            setLoading(false);
        }
    }, [id]);
    
    useEffect(() => {
        if (id) {
           fetchOrder();
        }
    }, [id, fetchOrder]);
    
    const handleCancelOrder = async () => {
        const confirmResult = await Swal.fire({
            title: 'Xác nhận hủy đơn',
            text: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Hủy đơn hàng',
            cancelButtonText: 'Đóng'
        });
        if (!confirmResult.isConfirmed) return;

        setIsCancelling(true);
        setError(null);
        try {
            const response = await cancelOrder(order.order_id);
            Swal.fire({
                title: 'Thành công',
                text: 'Đã hủy đơn hàng thành công!',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
            setOrder(response.data); 
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
            Swal.fire({
                title: 'Thất bại',
                text: err.response?.data?.error || 'Không thể hủy đơn hàng. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleOpenReviewModal = (product) => {
        setSelectedProduct(product);
        setReviewModalOpen(true);
    };

    const handleReviewSubmit = async (reviewData) => {
        const existingReview = productReviews[selectedProduct.product_id];
        
        if (existingReview) {
            // Cập nhật review
            await updateReview(existingReview.review_id, reviewData);
        } else {
            // Tạo review mới
            await createReview({
                ...reviewData,
                product_id: selectedProduct.product_id,
                order_id: order.order_id
            });
        }
        
        // Refresh reviews
        await fetchOrder();
    };

    const handleRequestReturn = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Yêu cầu trả hàng',
            input: 'text',
            inputLabel: 'Vui lòng nhập lý do yêu cầu trả hàng:',
            inputPlaceholder: 'Nhập lý do tại đây...',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Gửi yêu cầu',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return 'Lý do trả hàng không được để trống!';
                }
            }
        });

        if (!reason) return;

        const confirmResult = await Swal.fire({
            title: 'Xác nhận gửi yêu cầu',
            text: 'Bạn có chắc chắn muốn gửi yêu cầu trả hàng cho đơn hàng này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });
        if (!confirmResult.isConfirmed) return;

        setIsRequestingReturn(true);
        try {
            await requestReturn(id, reason);
            Swal.fire({
                title: 'Thành công',
                text: 'Đã gửi yêu cầu trả hàng thành công!',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
            await fetchOrder();
        } catch (err) {
            Swal.fire({
                title: 'Thất bại',
                text: err.response?.data?.error || 'Không thể gửi yêu cầu trả hàng',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsRequestingReturn(false);
        }
    };

    // Helper: Kiểm tra xem có thể đánh giá không (trong 15 ngày)
    const canReview = () => {
        if (!order || !order.delivered_at) return false;
        const deliveredAt = new Date(order.delivered_at);
        const now = new Date();
        const daysSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60 * 24);
        return daysSinceDelivery <= 15;
    };

    const calculateSubtotal = () => !order ? 0 : order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotal = calculateSubtotal();
    const discountAmount = order ? subtotal - order.total_amount : 0;

    if (loading) return <p className="text-center py-10">Đang tải...</p>;
    if (error) return <p className="text-center py-10 text-red-600 bg-red-100 p-4 rounded">{error}</p>;
    if (!order) return <p className="text-center py-10">Không tìm thấy đơn hàng.</p>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-6 md:py-10 px-4 mt-14 md:mt-16">
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
                            {order.items.map(item => {
                                const itemReview = productReviews[item.product_id];
                                return (
                                <div key={item.order_item_id} className="border-b py-4 last:border-b-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start flex-grow">
                                            <Link to={`/products/${item.product_id}`}>
                                                <img 
                                                    src={item.primary_image_url || 'https://placehold.co/80'} 
                                                    alt={item.product_name} 
                                                    className="w-24 h-24 rounded-md object-cover mr-4 hover:opacity-80 transition-opacity"
                                                />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link to={`/products/${item.product_id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                                    {item.product_name}
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                     Phân loại: Size {item.size || 'N/A'}
                                                     {item.color && item.color !== 'default' ? `, Màu ${item.color}` : ''}
                                                 </p>
                                                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                                <p className="font-semibold mt-2">{(item.price * item.quantity).toLocaleString('en-US')} $</p>
                                                
                                                {order.status === 'delivered' && (
                                                    <div className="mt-3">
                                                        {itemReview ? (
                                                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-yellow-500 text-lg">
                                                                        {'★'.repeat(itemReview.rating)}{'☆'.repeat(5 - itemReview.rating)}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">({itemReview.rating}/5)</span>
                                                                </div>
                                                                {itemReview.comment && (
                                                                    <p className="text-sm text-gray-700 mb-2">{itemReview.comment}</p>
                                                                )}
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-gray-500">
                                                                        Đã đánh giá {new Date(itemReview.created_at).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                    {itemReview.edit_count < 1 && canReview() && (
                                                                        <button
                                                                            onClick={() => handleOpenReviewModal(item)}
                                                                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                                        >
                                                                            ✏️ Sửa đánh giá
                                                                        </button>
                                                                    )}
                                                                    {itemReview.edit_count >= 1 && (
                                                                        <span className="text-xs text-gray-500">(Đã sửa 1/1 lần)</span>
                                                                    )}
                                                                    {!canReview() && itemReview.edit_count < 1 && (
                                                                        <span className="text-xs text-gray-500">(Đã quá 15 ngày)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : canReview() ? (
                                                            <button
                                                                onClick={() => handleOpenReviewModal(item)}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                                            >
                                                                ⭐ Đánh giá sản phẩm
                                                            </button>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic">
                                                                Đã quá 15 ngày kể từ khi nhận hàng
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
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

                        {/* Hiển thị phần trả hàng dựa trên trạng thái */}
                        {order.status === 'delivered' ? (
                            // Đơn đã giao - kiểm tra điều kiện trả hàng
                            canReturn.canReturn ? (
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold mb-4">Yêu cầu trả hàng</h3>
                                    <p className="text-sm text-gray-600 mb-3">Bạn có thể yêu cầu trả hàng trong vòng 7 ngày sau khi nhận hàng.</p>
                                    <button
                                        onClick={handleRequestReturn}
                                        disabled={isRequestingReturn}
                                        className="w-full bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-yellow-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isRequestingReturn ? 'Đang gửi yêu cầu...' : '📦 Yêu cầu trả hàng'}
                                    </button>
                                </div>
                            ) : canReturn.reason ? (
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold mb-4">Trả hàng</h3>
                                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                                        <p className="font-semibold mb-1">❌ Không thể trả hàng</p>
                                        <p>
                                            {canReturn.reason === 'Cannot return reviewed products' 
                                                ? 'Sản phẩm đã đánh giá không thể trả hàng.' 
                                                : canReturn.reason === 'Return period expired (7 days)' 
                                                ? 'Đã quá thời hạn 7 ngày trả hàng.' 
                                                : canReturn.reason}
                                        </p>
                                    </div>
                                </div>
                            ) : null
                        ) : (order.status === 'pending' || order.status === 'processing' || order.status === 'shipped') ? (
                            // Đơn chưa giao - hiển thị thông báo
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Trả hàng</h3>
                                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                                    <p className="font-semibold mb-1">ℹ️ Thông báo</p>
                                    <p>Bạn có thể yêu cầu trả hàng sau khi đã nhận được sản phẩm.</p>
                                </div>
                            </div>
                        ) : null}

                        {order.status === 'return_requested' && (
                             <div className="bg-white p-6 rounded-lg shadow-md">
                                 <h3 className="text-xl font-semibold mb-4">Yêu cầu trả hàng</h3>
                                 <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
                                     <p className="font-semibold mb-1">🔄 Đang chờ xử lý</p>
                                     <p>Yêu cầu trả hàng của bạn đang được xem xét. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                                 </div>
                             </div>
                        )}
                        
                        {order.status === 'returning' && (
                             <div className="bg-white p-6 rounded-lg shadow-md">
                                 <h3 className="text-xl font-semibold mb-4">Đang hoàn hàng</h3>
                                 <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
                                     <p className="font-semibold mb-1">📦 Vui lòng trả hàng</p>
                                     <p>Yêu cầu của bạn đã được chấp thuận. Vui lòng gửi hàng trả lại theo địa chỉ chúng tôi sẽ thông báo.</p>
                                 </div>
                             </div>
                        )}
                        
                        {order.status === 'refunded' && (
                             <div className="bg-white p-6 rounded-lg shadow-md">
                                 <h3 className="text-xl font-semibold mb-4">Trạng thái hoàn tiền</h3>
                                 <div className="bg-green-100 p-3 rounded text-sm text-green-800">
                                     <p className="font-semibold mb-1">✅ Đã hoàn tiền</p>
                                     <p>Đơn hàng đã được hoàn tiền thành công.</p>
                                 </div>
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
                                <div className="flex justify-between"><span>Tạm tính:</span><span>{subtotal.toLocaleString('en-US')} $</span></div>
                                {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá ({order.promotion_code}):</span><span>- {discountAmount.toLocaleString('en-US')} $</span></div>}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><span>Tổng cộng:</span><span className="text-red-600">{order.total_amount.toLocaleString('en-US')} $</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                product={selectedProduct}
                orderId={order?.order_id}
                existingReview={selectedProduct ? productReviews[selectedProduct.product_id] : null}
                onReviewSubmitted={handleReviewSubmit}
            />
        </div>
    );
};

export default OrderDetailPage;