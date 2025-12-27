import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAddress, createOrder, getCart, getAddresses } from '../services/api'; 
import axios from 'axios';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
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
  
    useEffect(() => {
        const initialFetch = async () => {
            try {
                const [cartResponse, addressesResponse] = await Promise.all([
                    getCart(),
                    getAddresses() 
                ]);
                
                setCart(cartResponse.data);
                
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

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return appliedPromotion ? appliedPromotion.new_total : total;
    };

    const handleApplyPromotion = async () => {
        if (!promotionCode) return setError('Vui lòng nhập mã khuyến mãi');
        try {
            const initialTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const response = await axios.post(
                'http://localhost:5000/api/promotions/apply', 
                { code: promotionCode, total_amount: initialTotal },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setAppliedPromotion({
                code: promotionCode,
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
        
        try {
            const orderData = {
                address_id: addressIdToUse,
                total_amount: calculateTotal(),
                promotion_code: appliedPromotion ? promotionCode : null,
                items: cart.items.map((item) => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            await createOrder(orderData);
            
            alert('Đặt hàng thành công!');
            navigate('/orders'); 

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

                        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất Đặt hàng'}
                        </button>
                    </form>
                </div>
                <div>
                    <div className="border rounded-lg p-6 bg-white">
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
                        {cart && cart.items ? (
                            <div className="space-y-3">
                                {cart.items.map((item) => (
                                    <div key={item.cart_item_id} className="flex justify-between items-center text-sm border-b pb-2">
                                        <div>
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-gray-500">Phân loại: Size {item.size || 'N/A'}</p>
                    <p className="text-gray-500">Số lượng: x{item.quantity}</p>
                </div>
                <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')} VND</p>
            </div>
        ))}
                                <div className="border-t pt-3 space-y-2">
                                    {appliedPromotion && <div className="flex justify-between text-green-600"><span>Giảm giá ({promotionCode}):</span><span>- {(cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - appliedPromotion.new_total).toLocaleString('vi-VN')} VND</span></div>}
                                    <div className="flex justify-between font-bold text-lg"><span>Tổng cộng:</span><span className="text-red-600">{calculateTotal().toLocaleString('vi-VN')} VND</span></div>
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