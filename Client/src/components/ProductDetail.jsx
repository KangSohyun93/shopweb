import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getProductById, getVariants, getReviews, addToCart } from '../services/api';
import ProductImageGallery from './ProductImageGallery';
import ProductInfoSection from './ProductInfoSection';
import ReviewsSection from './ReviewsSection';
import RecommendationsSection from './RecommendationsSection';
import useProductTracking from '../hooks/useProductTracking';
import useRecommendations from '../hooks/useRecommendations';

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

    const { handleMouseEnter, handleMouseLeave, trackAddToCart } = useProductTracking(id, product?.category_id);
    const { recommendations, recIsLoadingMore, recHasMore, lastRecElementRef, fallbackMode } = useRecommendations(id);

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

            } catch (err) {
                setError('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) { 
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng chọn một biến thể',
                icon: 'warning',
                confirmButtonColor: '#3085d6'
            });
            return; 
        }
        
        if (localStorage.getItem('token')) {
            try {
                await addToCart(selectedVariant.variant_id, quantity);
                trackAddToCart();
                Swal.fire({
                    title: 'Thành công',
                    text: 'Đã thêm sản phẩm vào giỏ hàng!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    Swal.fire({
                        title: 'Phiên đăng nhập hết hạn',
                        text: 'Vui lòng đăng nhập lại để tiếp tục mua hàng.',
                        icon: 'info',
                        confirmButtonColor: '#3085d6'
                    }).then(() => {
                        navigate('/login');
                    });
                } else {
                    Swal.fire({
                        title: 'Thất bại',
                        text: err.response?.data?.error || 'Không thể thêm vào giỏ hàng.',
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        } else {
            Swal.fire({
                title: 'Yêu cầu đăng nhập',
                text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#aaa',
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        }
    };

    if (loading) return <p className="text-center py-10 font-medium text-gray-500">Đang tải thông tin sản phẩm...</p>;
    if (error) return <p className="text-center py-10 text-red-600 font-medium">{error}</p>;
    if (!product) return <p className="text-center py-10">Sản phẩm không tồn tại</p>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-8 px-4 mt-14 md:mt-16">
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
                    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <ProductImageGallery product={product} displayImage={displayImage} setDisplayImage={setDisplayImage} />
                    </div>

                    <ProductInfoSection 
                        product={product}
                        reviews={reviews}
                        selectedVariant={selectedVariant}
                        quantity={quantity}
                        onVariantSelect={handleVariantSelect}
                        onQuantityChange={setQuantity}
                        onAddToCart={handleAddToCart}
                    />
                </div>

                <ReviewsSection reviews={reviews} />

                <RecommendationsSection 
                    recommendations={recommendations}
                    isLoadingMore={recIsLoadingMore}
                    hasMore={recHasMore}
                    lastRecElementRef={lastRecElementRef}
                    fallbackMode={fallbackMode}
                />
            </div>
        </div>
    );
};

export default ProductDetail;