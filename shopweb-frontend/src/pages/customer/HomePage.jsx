import { useState, useEffect } from 'react';
import ProductList from '../../components/ProductList';
import ErrorBoundary from '../../components/ErrorBoundary';
import { getAllProducts, getVariants } from '../../services/api';

const HomePage = () => {
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, variantsRes] = await Promise.all([
          getAllProducts(),
          getVariants(),
        ]);
        console.log('API response (getAllProducts) - Raw Data:', productsRes.data);
        console.log('API response (getVariants) - Raw Data:', variantsRes.data);

        // Kiểm tra dữ liệu sản phẩm
        const rawProducts = productsRes.data || [];
        if (!Array.isArray(rawProducts)) {
          throw new Error('Dữ liệu từ getAllProducts không phải là mảng: ' + JSON.stringify(rawProducts));
        }
        const validProducts = rawProducts.filter(p => p && p.product_id && p.name && p.category_name);
        const validVariants = variantsRes.data.filter(v => v.product_id && v.sku && v.price);
        const variantMap = {};
        validVariants.forEach(v => {
          if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
          variantMap[v.product_id].push(v);
        });
        const combinedProducts = validProducts.map(product => ({
          ...product,
          name: product.name || `Product ${product.product_id}`,
          description: product.description || 'No description provided',
          brand_name: product.brand_name || 'Unknown Brand',
          price: variantMap[product.product_id]?.[0]?.price || 0, 
          variants: variantMap[product.product_id] || [],
        }));

        const groupedByCategory = combinedProducts.reduce((acc, product) => {
          const category = product.category_name || 'Unknown Category';
          if (!acc[category]) acc[category] = [];
          acc[category].push(product);
          return acc;
        }, {});
        const topCategories = Object.keys(groupedByCategory).slice(0, 5);
        const limitedCategoryProducts = {};
        topCategories.forEach(category => {
          limitedCategoryProducts[category] = groupedByCategory[category];
        });

        setCategoryProducts(limitedCategoryProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại. Chi tiết: ' + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <ErrorBoundary>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : Object.keys(categoryProducts).length === 0 ? (
          <p className="text-center text-red-600">Không có danh mục nào để hiển thị.</p>
        ) : (
          Object.keys(categoryProducts).map((category, index) => (
            <div key={index} className="mb-8">
              <h2
                className="relative text-4xl md:text-5xl font-extrabold mb-6 tracking-widest uppercase text-center
                           py-6 rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
                style={{
                  letterSpacing: '4px',
                  textShadow: 'none',
                  transition: 'transform 0.2s',
                  background: 'linear-gradient(120deg, #f8fafc 0%, #fbc2eb 40%, #a6c1ee 100%)'
                }}
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, #fbc2eb55 0%, #a6c1ee33 60%, transparent 100%)',
                    zIndex: 1
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 inline-block transform hover:scale-110 transition-transform duration-300 drop-shadow-xl text-[#22336b]">
                  {category}
                </span>
              </h2>
              <ProductList
                products={categoryProducts[category]}
                onAddToCart={() => {}}
              />
            </div>
          ))
        )}
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;