import StarRating from './StarRating';
import VariantSelector from './VariantSelector';

const ProductInfoSection = ({ 
    product, 
    reviews, 
    selectedVariant, 
    quantity, 
    onVariantSelect, 
    onQuantityChange, 
    onAddToCart 
}) => {
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return (
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
                <VariantSelector variants={product.variants || []} onSelect={onVariantSelect} selectedVariantId={selectedVariant?.variant_id} />
                
                {selectedVariant && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <span className="text-sm font-semibold text-gray-700 mr-3">Số lượng:</span>
                                <div className="flex items-center border rounded-lg overflow-hidden">
                                    <button onClick={() => onQuantityChange(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg hover:bg-gray-100 transition">-</button>
                                    <input type="text" value={quantity} readOnly className="w-14 text-center border-l border-r py-2 font-semibold bg-gray-50" />
                                    <button onClick={() => onQuantityChange(q => q + 1)} className="px-4 py-2 text-lg hover:bg-gray-100 transition">+</button>
                                </div>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                                <span className={`w-3 h-3 rounded-full mr-2 ${selectedVariant.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} có sẵn` : 'Hết hàng'}
                            </div>
                        </div>
                        <button onClick={onAddToCart} disabled={selectedVariant.stock_quantity <= 0} className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductInfoSection;
