import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Đảm bảo bạn đã thêm hàm getRecommendations vào file api.js nhé
import { getProductById, getVariants, getReviews, addToCart, getRecommendations } from '../services/api';
import axios from 'axios';
import VariantSelector from './VariantSelector';

const StarRating = ({ rating, reviewCount }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <svg key={index} className={`w-5 h-5 ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
        {reviewCount > 0 && <span className="text-sm text-gray-600">({reviewCount} đánh giá)</span>}
    </div>
);

const ProductImageGallery = ({ product, displayImage, setDisplayImage }) => {
    const galleryImages = [
        ...(product.primary_image_url ? [{ id: 'primary', url: product.primary_image_url }] : []),
        ...(product.additional_images || []).filter(img => img.image_url !== product.primary_image_url).map(img => ({ id: img.image_id, url: img.image_url }))
    ];

    return (
        <div>
            <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                <img src={displayImage} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
            </div>
            {galleryImages.length > 1 && (
                <div className="mt-4 flex space-x-3 overflow-x-auto p-2">
                    {galleryImages.map(img => (
                        <img key={img.id} src={img.url} alt="Thumbnail" onClick={() => setDisplayImage(img.url)} className={`w-20 h-20 object-contain rounded-lg border-2 cursor-pointer transition ${displayImage === img.url ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}`} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    // State mới cho Hệ thống gợi ý
    const [recommendations, setRecommendations] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [displayImage, setDisplayImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // State cho Tracking
    const [startTime, setStartTime] = useState(Date.now());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, variantsRes, reviewsRes] = await Promise.all([
                    getProductById(id), 
                    getVariants(id), 
                    getReviews(id)
                ]);
                
                const fetchedProduct = productRes.data;
                const fetchedVariants = variantsRes.data;

                setProduct(fetchedProduct);
                setVariants(fetchedVariants);
                setReviews(reviewsRes.data);

                if (fetchedVariants.length > 0) setSelectedVariant(fetchedVariants[0]);
                setDisplayImage(fetchedProduct.primary_image_url || 'https://via.placeholder.com/500');

                // Gọi API lấy danh sách gợi ý (được bọc trong try-catch riêng để không làm chết trang nếu lỗi AI)
                try {
                    const recRes = await getRecommendations(id);
                    if (recRes && recRes.success) {
                        setRecommendations(recRes.data);
                    }
                } catch (recErr) {
                    console.error("Lỗi lấy dữ liệu gợi ý:", recErr);
                }

            } catch (err) {
                setError('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        // Quan trọng: Tự động cuộn trang lên trên cùng khi ID sản phẩm thay đổi
        window.scrollTo(0, 0); 
    }, [id]);

    // 📊 TRACKING: Ghi nhận thời gian dừng lại khi rời khỏi trang
    useEffect(() => {
        // Reset startTime khi component mount
        setStartTime(Date.now());
        
        // Hàm gửi tracking khi component unmount (người dùng rời khỏi trang)
        return () => {
            const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
            
            // Lấy session_id từ localStorage (nếu chưa login)
            let sessionId = localStorage.getItem('session_id');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('session_id', sessionId);
            }

            // Gửi tracking API
            axios.post('http://localhost:5000/api/tracking', {
                product_id: id,
                category_id: product?.category_id,
                interaction_type: 'view',
                dwell_time: timeSpentSeconds,
                session_id: sessionId
            }, {
                // Kèm theo token nếu User đã đăng nhập
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'Content-Type': 'application/json'
                }
            }).catch(err => {
                // Silent fail để không làm gián đoạn UX
                console.log('Tracking silent fail:', err.message);
            });
        };
    }, [id, product?.category_id, startTime]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) { alert('Vui lòng chọn một biến thể'); return; }
        if (localStorage.getItem('token')) {
            try {
                await addToCart(selectedVariant.variant_id, quantity);
                
                // 📊 TRACKING: Ghi nhận khi thêm vào giỏ hàng
                let sessionId = localStorage.getItem('session_id');
                if (!sessionId) {
                    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('session_id', sessionId);
                }
                
                axios.post('http://localhost:5000/api/tracking', {
                    product_id: id,
                    category_id: product?.category_id,
                    interaction_type: 'add_to_cart',
                    dwell_time: null,
                    session_id: sessionId
                }, {
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(err => {
                    console.log('Tracking silent fail:', err.message);
                });
                
                alert('Đã thêm vào giỏ hàng!');
            } catch (err) {
                alert('Không thể thêm vào giỏ hàng.');
            }
        } else {
            navigate('/login');
        }
    };

    if (loading) return <p className="text-center py-10 font-medium text-gray-500">Đang tải thông tin sản phẩm...</p>;
    if (error) return <p className="text-center py-10 text-red-600 font-medium">{error}</p>;
    if (!product) return <p className="text-center py-10">Sản phẩm không tồn tại</p>;

    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-12 px-4">

                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-gray-600 font-semibold hover:text-blue-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ProductImageGallery product={product} displayImage={displayImage} setDisplayImage={setDisplayImage} />

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>{product.category_name || 'Danh mục'}</span> / <span>{product.brand_name || 'Thương hiệu'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        {reviews.length > 0 && <div className="mb-4"><StarRating rating={averageRating} reviewCount={reviews.length} /></div>}
                        <p className="text-3xl font-bold text-blue-600 mb-6">
                            {selectedVariant ? `${Number(selectedVariant.price).toLocaleString('vi-VN')} $` : 'Chọn biến thể để xem giá'}
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-6">{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>

                        <div className="mt-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <VariantSelector variants={variants} onSelect={handleVariantSelect} selectedVariantId={selectedVariant?.variant_id} />
                            
                            {selectedVariant && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center">
                                            <span className="text-sm font-semibold text-gray-700 mr-3">Số lượng:</span>
                                            <div className="flex items-center border rounded-lg overflow-hidden">
                                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg hover:bg-gray-100 transition">-</button>
                                                <input type="text" value={quantity} readOnly className="w-14 text-center border-l border-r py-2 font-semibold bg-gray-50" />
                                                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-lg hover:bg-gray-100 transition">+</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-medium">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${selectedVariant.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} có sẵn` : 'Hết hàng'}
                                        </div>
                                    </div>
                                    <button onClick={handleAddToCart} disabled={selectedVariant.stock_quantity <= 0} className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KHU VỰC HIỂN THỊ ĐÁNH GIÁ */}
                <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá từ khách hàng</h2>
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                        <div className="space-y-6">{reviews.map((review) => (
                            <div key={review.review_id} className="flex gap-4 border-b pb-6 last:border-0 last:pb-0">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                    {review.username ? review.username.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-semibold text-gray-900">{review.username || 'Khách hàng ẩn danh'}</span>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{new Date(review.created_at).toLocaleString('vi-VN')}</p>
                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))}</div>
                    )}
                </div>

                {/* KHU VỰC AI GỢI Ý MUA KÈM (MỚI) */}
                {recommendations && recommendations.length > 0 && (
                    <div className="mt-12 pt-8">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Khách hàng cũng mua</h2>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded ml-2">Gợi ý bởi AI</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {recommendations.map((rec) => (
                                <Link to={`/products/${rec.product_id}`} key={rec.product_id} className="block group">
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                                            <img 
                                                src={rec.primary_image_url || 'https://via.placeholder.com/300'} 
                                                alt={rec.name} 
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
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetail;