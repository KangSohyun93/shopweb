import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCart, updateCartItem, deleteCartItem, updateCartItemVariant } from '../../services/api';
import axios from 'axios';

const CartPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    
    // 📖 INFINITE SCROLL: State cho recommendations
    const [recommendations, setRecommendations] = useState([]);
    const [recPage, setRecPage] = useState(1);
    const [recHasMore, setRecHasMore] = useState(true);
    const [recIsLoadingMore, setRecIsLoadingMore] = useState(false);
    
    const recObserverRef = useRef();

    // 📌 INTERSECTION OBSERVER: Khi scroll tới sản phẩm gợi ý cuối, tải thêm
    const lastRecElementRef = useCallback(node => {
        if (recIsLoadingMore) return;
        if (recObserverRef.current) recObserverRef.current.disconnect();
        
        recObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && recHasMore && !recIsLoadingMore) {
                setRecPage(prevPage => prevPage + 1);
            }
        }, { threshold: 0.1 });
        
        if (node) recObserverRef.current.observe(node);
    }, [recIsLoadingMore, recHasMore]);

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
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

    const cartProductIdsStr = cart && cart.items 
        ? cart.items.map(item => item.product_id).sort().join(',') 
        : '';

    // Reset recommendations when the cart items change
    useEffect(() => {
        setRecommendations([]);
        setRecPage(1);
        setRecHasMore(true);
    }, [cartProductIdsStr]);

    // 📖 FETCH RECOMMENDATIONS (Infinite Scroll)
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!recHasMore || loading) return;
            
            setRecIsLoadingMore(true);
            try {
                const token = localStorage.getItem('token');
                
                const res = await axios.get(
                    `http://localhost:5000/api/recommendations/cart?product_ids=${cartProductIdsStr}&page=${recPage}&limit=10`,
                    {
                        headers: {
                            ...(token && { Authorization: `Bearer ${token}` })
                        }
                    }
                );

                if (res.data.success) {
                    setRecommendations(prev => {
                        // ✅ Append mode: Nối danh sách, loại trùng lặp
                        const newItems = res.data.data.filter(
                            newItem => !prev.some(existingItem => existingItem.product_id === newItem.product_id)
                        );
                        return [...prev, ...newItems];
                    });
                    setRecHasMore(res.data.hasMore);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setRecIsLoadingMore(false);
            }
        };

        if (!loading && (recPage > 1 || recommendations.length === 0)) {
            fetchRecommendations();
        }
    }, [recPage, recHasMore, cartProductIdsStr, loading]);

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        const originalCart = { ...cart };
        setCart(prev => ({ ...prev, items: prev.items.map(item => item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item) }));
        try {
            await updateCartItem(cartItemId, newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Không thể cập nhật số lượng. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
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
            Swal.fire({
                title: 'Lỗi',
                text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
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
            Swal.fire({
                title: 'Lỗi',
                text: 'Không thể thay đổi biến thể. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
            setCart(originalCart);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items
            .filter(item => selectedItems.has(item.cart_item_id))
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleSelectItem = (cartItemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cartItemId)) {
                newSet.delete(cartItemId);
            } else {
                newSet.add(cartItemId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.size === cart?.items?.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cart?.items?.map(item => item.cart_item_id) || []));
        }
    };

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!',
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Lưu selected items vào localStorage
        localStorage.setItem('selectedCartItems', JSON.stringify(Array.from(selectedItems)));
        navigate('/checkout');
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h2 className="text-3xl font-extrabold mb-8 text-[#22336b] text-center">Giỏ hàng của bạn</h2>
            {loading ? (
                <p className="text-center text-lg">Đang tải...</p>
            ) : !localStorage.getItem('token') ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-lg mx-auto">
                    <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="unauthenticated cart" className="w-28 h-28 mb-4 opacity-50" />
                    <p className="text-gray-800 text-xl font-bold mb-2">Bạn chưa đăng nhập</p>
                    <p className="text-gray-500 text-sm mb-6 text-center">Vui lòng đăng nhập tài khoản của bạn để xem giỏ hàng và tiếp tục mua sắm.</p>
                    <Link to="/login" className="px-8 py-3 bg-[#22336b] text-white rounded-lg shadow hover:bg-blue-800 hover:shadow-lg transition-all font-semibold uppercase tracking-wider text-xs">Đăng nhập ngay</Link>
                </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="empty cart" className="w-32 h-32 mb-4 opacity-60" />
                    <p className="text-gray-500 text-xl">Giỏ hàng trống</p>
                    <Link to="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {/* SELECT ALL CHECKBOX */}
                    <div className="mb-6 flex items-center gap-3 pb-4 border-b">
                        <input
                            type="checkbox"
                            checked={selectedItems.size > 0 && selectedItems.size === cart?.items?.length}
                            onChange={handleSelectAll}
                            className="w-5 h-5 cursor-pointer"
                        />
                        <label className="text-gray-700 font-semibold cursor-pointer">Chọn tất cả</label>
                        {selectedItems.size > 0 && (
                            <span className="ml-auto text-sm text-gray-600">Đã chọn {selectedItems.size} sản phẩm</span>
                        )}
                    </div>
                    
                    <div className="space-y-6">
                        {cart.items.map((item) => (
                            <div key={item.cart_item_id} className={`border rounded-2xl p-6 bg-white shadow-lg flex flex-col md:flex-row md:items-center gap-6 transition ${selectedItems.has(item.cart_item_id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.cart_item_id)}
                                    onChange={() => handleSelectItem(item.cart_item_id)}
                                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                                />
                                
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
                                        {Number(item.price).toLocaleString('vi-VN')} $
                                    </p>
                                    <button onClick={() => handleDeleteItem(item.cart_item_id)} className="text-red-500 hover:text-red-700 mt-4 text-sm underline">Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-xl font-bold text-[#22336b]">Tổng cộng: <span className="text-[#bfa14a]">{calculateTotal().toLocaleString('vi-VN')} $</span></div>
                        <button 
                            onClick={handleCheckout}
                            disabled={selectedItems.size === 0}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                        >
                            Tiến hành thanh toán ({selectedItems.size})
                        </button>
                    </div>
                </div>
            )}

            {/* KHU VỰC GỢI Ý SẢN PHẨM */}
            {recommendations && recommendations.length > 0 && (
                <div className="mt-16 pt-8 mx-auto max-w-6xl">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Bạn có thể thích</h2>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded ml-2">Gợi ý bởi AI</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {recommendations.map((rec, index) => {
                            // 📌 Gắn ref vào sản phẩm gợi ý cuối cùng để trigger infinite scroll
                            const isLastElement = recommendations.length === index + 1;
                            
                            return (
                                <Link 
                                    ref={isLastElement ? lastRecElementRef : null}
                                    to={`/products/${rec.product_id}`} 
                                    key={rec.product_id} 
                                    className="block group"
                                >
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                                            <img 
                                                src={rec.primary_image_url || 'https://via.placeholder.com/300'} 
                                                alt={rec.name} 
                                                loading="lazy"
                                                className="h-48 w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-grow group-hover:text-blue-600 transition-colors">
                                            {rec.name}
                                        </h4>
                                        <p className="mt-3 text-lg font-bold text-red-600">
                                            {rec.price ? `$${Number(rec.price).toLocaleString('en-US')}` : 'Liên hệ'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    
                    {/* 📥 LOADING SPINNER - Hiển thị khi đang load thêm */}
                    {recIsLoadingMore && (
                        <div className="flex justify-center mt-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-red-600"></div>
                        </div>
                    )}
                    
                    {/* ✅ HẾT HÀNG - Hiển thị khi không còn sản phẩm */}
                    {!recHasMore && recommendations.length > 0 && (
                        <div className="text-center mt-12 text-gray-500 text-lg">
                            🎉 Đã tải hết sản phẩm gợi ý!
                        </div>
                    )}
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