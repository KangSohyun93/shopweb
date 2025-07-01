import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, updateOrderStatus } from '../../services/api';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const response = await getOrderDetails(id);
      setOrder(response.data);
      setStatus(response.data.status || 'pending');
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async () => {
    setUpdateMessage('');
    setError('');
    setIsUpdating(true);
    
    try {
      const response = await updateOrderStatus(id, status);
      setOrder(response.data);
      setUpdateMessage('Cập nhật trạng thái thành công!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabels = {
    pending: 'Đang xử lý',
    processing: 'Đang chuẩn bị hàng',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
  };

  if (loading) return <p className="text-center py-10">Đang tải...</p>;

  return (
    <div className="container mx-auto py-8 px-4">
        {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        {updateMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md mb-4">{updateMessage}</p>}

        {!order ? (
            <p className="text-center text-gray-600">Không tìm thấy đơn hàng.</p>
        ) : (
            <>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Chi tiết đơn hàng #{order.order_id}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="border rounded-lg p-6 bg-white shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Sản phẩm trong đơn</h3>
                            {order.items?.length === 0 ? (
                                <p className="text-gray-600">Không có sản phẩm.</p>
                            ) : (
                                <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.order_item_id} className="flex items-start justify-between border-b pb-4 last:border-b-0">
                                        <div className="flex items-start flex-grow">
                                            <Link to={`/products/${item.product_id}`}>
                                                <img 
                                                    src={item.primary_image_url || 'https://placehold.co/80'} 
                                                    alt={item.product_name} 
                                                    className="w-20 h-20 object-cover rounded-md mr-4 hover:opacity-80 transition-opacity" 
                                                />
                                            </Link>
                                            <div>
                                                <Link to={`/products/${item.product_id}`} className="font-semibold text-lg hover:text-blue-600 transition-colors">
                                                    {item.product_name}
                                                </Link>
                                                <p className="text-gray-500">Phân loại: Size {item.size || 'N/A'}</p>
                                                <p className="text-gray-500">Số lượng: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-gray-800 text-right min-w-[120px]">
                                            {(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')} VND
                                        </p>
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border rounded-lg p-6 bg-white shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h3>
                            <div className="space-y-2">
                                <p><strong>Khách hàng:</strong> {order.username || 'N/A'} ({order.user_email || 'N/A'})</p>
                                <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                                <p><strong>Tổng tiền:</strong> <span className="font-bold text-xl text-red-600">{Number(order.total_amount).toLocaleString('vi-VN')} VND</span></p>
                                {order.promotion_code && <p><strong>Mã giảm giá:</strong> {order.promotion_code}</p>}
                                <p><strong>Địa chỉ:</strong> {`${order.recipient_name}, ${order.street}, ${order.city}, ${order.country}`}</p>
                                <p><strong>Số điện thoại:</strong> {order.phone}</p>
                            </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-white shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Cập nhật trạng thái</h3>
                            <div className="space-y-3">
                                <p><strong>Trạng thái hiện tại:</strong> <span className="font-bold text-blue-600">{statusLabels[order.status] || order.status}</span></p>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={isUpdating}>
                                    <option value="pending">Đang xử lý</option>
                                    <option value="processing">Đang chuẩn bị hàng</option> 
                                    <option value="shipped">Đang giao hàng</option>
                                    <option value="delivered">Đã giao hàng</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                                <button onClick={handleUpdateStatus} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:bg-gray-400" disabled={isUpdating || order.status === status}>
                                    {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link to="/admin/orders" className="text-blue-500 hover:text-blue-700">← Quay lại danh sách đơn hàng</Link>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default AdminOrderDetail;

