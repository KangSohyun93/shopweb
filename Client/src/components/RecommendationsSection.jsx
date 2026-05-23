import { Link } from 'react-router-dom';

const RecommendationsSection = ({ 
    recommendations, 
    isLoadingMore, 
    hasMore, 
    lastRecElementRef, 
    fallbackMode 
}) => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="mt-12 pt-8">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {fallbackMode ? 'Bạn có thể thích' : 'Khách hàng cũng mua'}
                </h2>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded ml-2">Gợi ý bởi AI</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recommendations.map((rec, index) => {
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
            
            {isLoadingMore && (
                <div className="flex justify-center mt-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-red-600"></div>
                </div>
            )}
            
            {!hasMore && recommendations.length > 0 && (
                <div className="text-center mt-12 text-gray-500 text-lg">
                    🎉 Đã tải hết sản phẩm liên quan!
                </div>
            )}
        </div>
    );
};

export default RecommendationsSection;
