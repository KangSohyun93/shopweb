import { useState, useEffect } from 'react';
import ProductItem from './ProductItem';
//import { getAllProducts, getVariants, addToCart } from '../services/api';
import { Link } from 'react-router-dom';

const ProductList = ({ products, onAddToCart }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sử dụng props products thay vì gọi API trực tiếp
  useEffect(() => {
    if (!products || products.length === 0) {
      setError('Không có sản phẩm để hiển thị.');
    }
  }, [products]);

  const handleAddToCartLocal = async (variant_id, quantity) => {
    if (typeof onAddToCart !== 'function') return; // Bỏ qua nếu không có hàm
    try {
      setLoading(true);
      await onAddToCart(variant_id, quantity);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please login or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-red-600">Không có sản phẩm nào để hiển thị.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link
              key={product.product_id}
              to={`/products/${product.product_id}`}
              className="block"
            >
              <ProductItem
                product={product}
                variants={product.variants}
                onAddToCart={handleAddToCartLocal}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;