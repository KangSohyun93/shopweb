import { useState, useEffect } from 'react';

const ProductItem = ({ product, variants }) => {
    const [displayPrice, setDisplayPrice] = useState(0);

    useEffect(() => {
        if (product.price) {
            setDisplayPrice(product.price);
        } else if (variants && variants.length > 0) {
            setDisplayPrice(variants[0].price || 0);
        } else {
            setDisplayPrice(0);
        }
    }, [product.price, variants]);

    const imageUrl = product.primary_image_url || 'https://placehold.co/400x400';

    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={product.name || 'Sản phẩm'}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {product.brand_name && (
                    <div style={styles.ribbonWrapper}>
                        <div style={styles.ribbon}>
                            {product.brand_name}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">

                <h3 className="text-base font-bold text-gray-800 flex-grow line-clamp-2 min-h-[40px]">
                    {product.name || 'Tên sản phẩm không có'}
                </h3>
                
                <p className="text-lg font-medium text-red-600 mt-2">
                    {displayPrice.toLocaleString('vi-VN')} VND
                </p>
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-bold py-2 px-4 border-2 border-white rounded-md text-sm">
                    Xem Chi Tiết
                </span>
            </div>
        </div>
    );
};

const styles = {
    ribbonWrapper: {
        width: '120px',
        height: '120px',
        overflow: 'hidden',
        position: 'absolute',
        top: '-8px', 
        right: '-8px',
    },
    ribbon: {
        position: 'absolute',
        display: 'block',
        width: '170px', 
        padding: '8px 0',
        background: 'linear-gradient(45deg, #4f46e5, #0ea5e9)', 
        boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
        color: '#fff',
        font: 'bold 12px sans-serif',
        textAlign: 'center',
        transform: 'rotate(45deg)',
        right: '-45px',
        top: '30px',
    },
};

export default ProductItem;