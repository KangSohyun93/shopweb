import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItem, deleteCartItem, updateCartItemVariant } from '../../services/api';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        const originalCart = { ...cart };
        setCart(prev => ({ ...prev, items: prev.items.map(item => item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item) }));
        try {
            await updateCartItem(cartItemId, newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Không thể cập nhật số lượng. Vui lòng thử lại.');
            setCart(originalCart);
        }
    };

    const handleDeleteItem = async (cartItemId) => {
        const originalCart = { ...cart };
        setCart(prev => ({ ...prev, items: prev.items.filter(item => item.cart_item_id !== cartItemId) }));
        try {
            await deleteCartItem(cartItemId);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
            setCart(originalCart);
        }
    };

    const handleChangeVariant = async (cartItemId, newVariantId) => {
        const originalCart = { ...cart };
        try {
            await updateCartItemVariant(cartItemId, newVariantId);
            await fetchCart(); 
        } catch (error) {
            console.error('Error changing variant:', error);
            alert('Không thể thay đổi biến thể. Vui lòng thử lại.');
            setCart(originalCart);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h2 className="text-3xl font-extrabold mb-8 text-[#22336b] text-center">Giỏ hàng của bạn</h2>
            {loading ? (
                <p className="text-center text-lg">Đang tải...</p>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="empty cart" className="w-32 h-32 mb-4 opacity-60" />
                    <p className="text-gray-500 text-xl">Giỏ hàng trống</p>
                    <Link to="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                        {cart.items.map((item) => (
                            <div key={item.cart_item_id} className="border rounded-2xl p-6 bg-white shadow-lg flex flex-col md:flex-row md:items-center gap-6">
                                <Link to={`/products/${item.product_id}`}>
                                    <img
                                        src={item.primary_image_url || item.image_url || 'https://placehold.co/100x100'}
                                        alt={item.product_name}
                                        className="w-28 h-28 object-cover rounded-xl border hover:opacity-80 transition-opacity"
                                    />
                                </Link>

                                <div className="flex-1 flex flex-col gap-2">
                                    <Link to={`/products/${item.product_id}`} className="font-semibold text-lg text-[#22336b] hover:text-blue-700 transition-colors">
                                        {item.product_name}
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <label className="text-gray-600">Biến thể:</label>
                                        <select value={item.variant_id} onChange={(e) => handleChangeVariant(item.cart_item_id, e.target.value)} className="border rounded px-2 py-1 focus:ring focus:ring-blue-200">
                                            {item.variants && item.variants.map(variant => (
                                                <option key={variant.variant_id} value={variant.variant_id}>
                                                    {variant.size ? `Size: ${variant.size}` : variant.sku}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <label className="text-gray-600">Số lượng:</label>
                                        <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 text-black rounded-full hover:bg-blue-500 hover:text-white transition text-xl font-bold shadow" disabled={item.quantity <= 1} aria-label="Giảm" type="button">−</button>
                                        <input type="number" min={1} value={item.quantity} onChange={e => {const value = parseInt(e.target.value, 10); if (!isNaN(value) && value > 0) {handleUpdateQuantity(item.cart_item_id, value);}}} className="w-16 text-center bg-transparent outline-none font-semibold text-lg" style={{MozAppearance: 'textfield', appearance: 'textfield'}} onWheel={e => e.target.blur()} />
                                        <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 text-black rounded-full hover:bg-blue-500 hover:text-white transition text-xl font-bold shadow" aria-label="Tăng" type="button">+</button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end min-w-[120px]">
                                    <p className="text-xl text-gray-800 font-semibold">
                                        {Number(item.price).toLocaleString('vi-VN')} VND
                                    </p>
                                    <button onClick={() => handleDeleteItem(item.cart_item_id)} className="text-red-500 hover:text-red-700 mt-4 text-sm underline">Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-xl font-bold text-[#22336b]">Tổng cộng: <span className="text-[#bfa14a]">{calculateTotal().toLocaleString('vi-VN')} VND</span></div>
                        <Link to="/checkout" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition">Tiến hành thanh toán</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;


<style>{`
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none;
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
`}</style>