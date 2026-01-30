import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getVariants, getReviews, addToCart } from '../services/api';
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
        ...(product.additional_images || []).map(img => ({ id: img.image_id, url: img.image_url }))
    ];

    return (
        <div>
            <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            {galleryImages.length > 1 && (
                <div className="mt-4 flex space-x-3 overflow-x-auto p-2">
                    {galleryImages.map(img => (
                        <img key={img.id} src={img.url} alt="Thumbnail" onClick={() => setDisplayImage(img.url)} className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition ${displayImage === img.url ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}`} />
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [displayImage, setDisplayImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, variantsRes, reviewsRes] = await Promise.all([getProductById(id), getVariants(id), getReviews(id)]);
                const fetchedProduct = productRes.data;
                const fetchedVariants = variantsRes.data;

                setProduct(fetchedProduct);
                setVariants(fetchedVariants);
                setReviews(reviewsRes.data);

                if (fetchedVariants.length > 0) setSelectedVariant(fetchedVariants[0]);
                setDisplayImage(fetchedProduct.primary_image_url || 'https://via.placeholder.com/500');
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) { alert('Vui lòng chọn một biến thể'); return; }
        if (localStorage.getItem('token')) {
            try {
                await addToCart(selectedVariant.variant_id, quantity);
                alert('Đã thêm vào giỏ hàng!');
            } catch (err) {
                alert('Không thể thêm vào giỏ hàng.');
            }
        } else {
            navigate('/login');
        }
    };

    if (loading) return <p className="text-center py-10">Đang tải...</p>;
    if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
    if (!product) return <p className="text-center py-10">Sản phẩm không tồn tại</p>;

    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return (
        <div className="bg-gray-50">
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
                            <span>{product.category_name || 'Category'}</span> / <span>{product.brand_name || 'Brand'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        {reviews.length > 0 && <div className="mb-4"><StarRating rating={averageRating} reviewCount={reviews.length} /></div>}
                        <p className="text-3xl font-bold text-blue-600 mb-6">{selectedVariant ? `${selectedVariant.price.toLocaleString('vi-VN')} VND` : 'Chọn biến thể để xem giá'}</p>
                        <p className="text-gray-700 leading-relaxed mb-6">{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>

                        <div className="mt-auto bg-white p-6 rounded-lg shadow-md">
                            <VariantSelector variants={variants} onSelect={handleVariantSelect} selectedVariantId={selectedVariant?.variant_id} />
                            
                            {selectedVariant && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <span className="text-sm font-semibold mr-2">Số lượng:</span>
                                            <div className="flex items-center border rounded">
                                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg hover:bg-gray-100 rounded-l">-</button>
                                                <input type="text" value={quantity} readOnly className="w-12 text-center border-l border-r font-semibold" />
                                                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 text-lg hover:bg-gray-100 rounded-r">+</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-medium">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${selectedVariant.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} có sẵn` : 'Hết hàng'}
                                        </div>
                                    </div>
                                    <button onClick={handleAddToCart} disabled={selectedVariant.stock_quantity <= 0} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá từ khách hàng</h2>
                    {reviews.length === 0 ? (
                        <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                        <div className="space-y-6">{reviews.map((review) => (
                            <div key={review.review_id} className="flex gap-4 border-b pb-4 last:border-0">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500">{review.username ? review.username.charAt(0).toUpperCase() : '?'}</div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{review.username || 'Anonymous'}</span>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{new Date(review.created_at).toLocaleString('vi-VN')}</p>
                                    <p className="mt-2 text-gray-700">{review.comment}</p>
                                </div>
                            </div>
                        ))}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;