import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createAddress, createOrder, getCart, getAddresses, createVNPayPaymentUrl } from '../services/api'; 
import axios from 'axios';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [selectedCartItems, setSelectedCartItems] = useState(new Set());
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(''); 
    const [showNewAddressForm, setShowNewAddressForm] = useState(false); 

    const [formData, setFormData] = useState({
        recipient_name: '',
        phone: '',
        street: '',
        city: '',
        country: 'Vietnam'
    });

    const [promotionCode, setPromotionCode] = useState('');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [paymentMethod, setPaymentMethod] = useState('cod'); 
  
    useEffect(() => {
        const initialFetch = async () => {
            try {
                const [cartResponse, addressesResponse] = await Promise.all([
                    getCart(),
                    getAddresses() 
                ]);
                
                setCart(cartResponse.data);
                
                // Đọc selected items từ localStorage
                const selectedFromStorage = localStorage.getItem('selectedCartItems');
                if (selectedFromStorage) {
                    const parsed = JSON.parse(selectedFromStorage);
                    const numericIds = parsed.map(id => Number(id));
                    setSelectedCartItems(new Set(numericIds));
                } else {
                    // Nếu không có selected items, chọn tất cả
                    if (cartResponse.data?.items) {
                        setSelectedCartItems(new Set(cartResponse.data.items.map(item => Number(item.cart_item_id))));
                    }
                }
                
                const userAddresses = addressesResponse.data || [];
                setAddresses(userAddresses);

                const defaultAddress = userAddresses.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.address_id);
                } else if (userAddresses.length > 0) {
                    setSelectedAddressId(userAddresses[0].address_id);
                } else {
                    setShowNewAddressForm(true);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải thông tin thanh toán.');
            }
        };
        initialFetch();
    }, []);

    const getSelectedItems = () => {
        if (!cart || !cart.items) return [];
        return cart.items.filter(item => selectedCartItems.has(item.cart_item_id));
    };

    const calculateTotal = () => {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) return 0;
        const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return appliedPromotion ? appliedPromotion.new_total : total;
    };

    const handleApplyPromotion = async () => {
        if (!promotionCode) return setError('Vui lòng nhập mã khuyến mãi');
        try {
            const selectedItems = getSelectedItems();
            const initialTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const response = await axios.post(
                'http://localhost:5000/api/promotions/apply', 
                { code: promotionCode, total_amount: initialTotal },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setAppliedPromotion({
                code: promotionCode,
                discount: response.data.discount,
                new_total: response.data.new_total,
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Mã khuyến mãi không hợp lệ');
            setAppliedPromotion(null);
        }
    };
    
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        let addressIdToUse = selectedAddressId;

        if (showNewAddressForm) {
            if (!formData.recipient_name || !formData.phone || !formData.street || !formData.city) {
                setError('Vui lòng điền đầy đủ thông tin địa chỉ mới.');
                setIsSubmitting(false);
                return;
            }
            try {
                const newAddressResponse = await createAddress(formData);
                addressIdToUse = newAddressResponse.data.address_id; 
            } catch (err) {
                setError('Không thể tạo địa chỉ mới. Vui lòng thử lại.');
                setIsSubmitting(false);
                return;
            }
        }
        
        if (!addressIdToUse) {
            setError('Vui lòng chọn hoặc tạo một địa chỉ giao hàng.');
            setIsSubmitting(false);
            return;
        }

        if (!cart || !cart.items.length) {
            setError('Giỏ hàng của bạn đang trống.');
            setIsSubmitting(false);
            return;
        }
        
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
            setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            setIsSubmitting(false);
            return;
        }
        
        try {
            // Tính tổng giá gốc (chưa giảm) từ selected items
            const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            const orderData = {
                address_id: addressIdToUse,
                total_amount: subtotal, // Gửi giá gốc, backend sẽ tự apply promotion
                promotion_code: appliedPromotion ? promotionCode : null,
                payment_method: paymentMethod,
                items: selectedItems.map((item) => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            const response = await createOrder(orderData);
            
            // Xóa danh sách sản phẩm đã thanh toán khỏi localStorage
            localStorage.removeItem('selectedCartItems');
            
            if (paymentMethod === 'vnpay') {
                const createdOrder = response.data;
                // Gọi API lấy URL thanh toán VNPay
                const vnpayRes = await createVNPayPaymentUrl(createdOrder.order_id, createdOrder.total_amount);
                if (vnpayRes.data && vnpayRes.data.paymentUrl) {
                    window.location.href = vnpayRes.data.paymentUrl;
                } else {
                    throw new Error('Không lấy được URL thanh toán VNPay');
                }
            } else {
                Swal.fire({
                    title: 'Đặt hàng thành công!',
                    text: 'Đơn hàng của bạn đã được ghi nhận. Cảm ơn bạn đã mua hàng!',
                    icon: 'success',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    navigate('/orders'); 
                });
            } 

        } catch (err) {
            console.error('Order error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-6">Thanh toán</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Thông tin giao hàng</h3>
                    <form onSubmit={handleSubmitOrder}>
                        {addresses.length > 0 && (
                             <div className="mb-4">
                                <select value={selectedAddressId} onChange={e => setSelectedAddressId(e.target.value)} className="w-full border rounded p-2 bg-white">
                                    {addresses.map(addr => (
                                        <option key={addr.address_id} value={addr.address_id}>
                                            {`${addr.recipient_name}, ${addr.street}, ${addr.city}`}
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="text-blue-600 text-sm mt-2 hover:underline">
                                    {showNewAddressForm ? 'Hủy' : 'Thêm địa chỉ mới'}
                                </button>
                             </div>
                        )}
                        
                        {showNewAddressForm && (
                            <div className="space-y-4 p-4 border rounded-md bg-gray-50 mb-4">
                                <input type="text" placeholder="Họ và tên *" className="w-full border rounded p-2" value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} />
                                <input type="text" placeholder="Số điện thoại *" className="w-full border rounded p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <input type="text" placeholder="Địa chỉ (số nhà, đường) *" className="w-full border rounded p-2" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                                <input type="text" placeholder="Thành phố *" className="w-full border rounded p-2" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700">Mã khuyến mãi</label>
                            <div className="flex"><input type="text" className="w-full border rounded-l-md px-3 py-2" value={promotionCode} onChange={(e) => setPromotionCode(e.target.value)} /><button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-r-md hover:bg-gray-600" onClick={handleApplyPromotion}>Áp dụng</button></div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">Phương thức thanh toán</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-3 h-4 w-4 text-blue-600" />
                                    <div>
                                        <span className="font-semibold text-gray-900 block text-sm">Thanh toán khi nhận hàng</span>
                                        <span className="text-gray-500 text-xs">COD</span>
                                    </div>
                                </label>
                                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="mr-3 h-4 w-4 text-blue-600" />
                                    <div>
                                        <span className="font-semibold text-gray-900 block text-sm">Thanh toán qua VNPay</span>
                                        <span className="text-gray-500 text-xs">Sandbox</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-semibold" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Hoàn tất Đặt hàng'}
                        </button>
                    </form>
                </div>
                <div>
                    <div className="border rounded-lg p-6 bg-white">
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
                        {cart && cart.items ? (
                            <div className="space-y-3">
                                {getSelectedItems().map((item) => (
                                    <div key={item.cart_item_id} className="flex justify-between items-center text-sm border-b pb-2">
                                        <div>
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-gray-500">
                                                Phân loại: Size {item.size || 'N/A'}
                                                {item.color && item.color !== 'default' ? `, Màu ${item.color}` : ''}
                                            </p>
                                            <p className="text-gray-500">Số lượng: x{item.quantity}</p>
                </div>
                <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')} $</p>
            </div>
        ))}
                                <div className="border-t pt-3 space-y-2">
                                    {appliedPromotion && <div className="flex justify-between text-green-600"><span>Giảm giá ({promotionCode}):</span><span>- {appliedPromotion.discount.toLocaleString('vi-VN')} $</span></div>}
                                    <div className="flex justify-between font-bold text-lg"><span>Tổng cộng:</span><span className="text-red-600">{calculateTotal().toLocaleString('vi-VN')} $</span></div>
                                </div>
                            </div>
                        ) : (<p>Giỏ hàng trống</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;