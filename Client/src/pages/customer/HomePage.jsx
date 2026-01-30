import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../../components/ProductList';
import ErrorBoundary from '../../components/ErrorBoundary';
import { getAllProducts, getVariants, getActiveBanners } from '../../services/api';

const HomePage = () => {
  const [categoryProducts, setCategoryProducts] = useState({});
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, variantsRes, bannersRes] = await Promise.all([
          getAllProducts(),
          getVariants(),
          getActiveBanners(),
        ]);
        console.log('API response (getAllProducts) - Raw Data:', productsRes.data);
        console.log('API response (getVariants) - Raw Data:', variantsRes.data);
        console.log('API response (getActiveBanners) - Raw Data:', bannersRes.data);

        // Lưu banners
        setBanners(bannersRes.data || []);

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

  // Auto-slide banner
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Chuyển banner sau mỗi 5 giây

    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Debug: Log banner hiện tại
  useEffect(() => {
    if (banners.length > 0 && banners[currentBannerIndex]) {
      console.log('Current Banner:', {
        index: currentBannerIndex,
        title: banners[currentBannerIndex].title,
        link: banners[currentBannerIndex].link_url,
        image: banners[currentBannerIndex].image_url
      });
    }
  }, [currentBannerIndex, banners]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="relative w-full bg-white shadow-lg mb-8">
          <div className="relative h-64 md:h-96 overflow-hidden">
            {banners.map((banner, index) => {
              const isActive = index === currentBannerIndex;
              
              // Xử lý link cho banner hiện tại
              const url = banner.link_url ? banner.link_url.trim() : '';
              const isLocalhost = url && (url.includes('localhost') || url.includes('127.0.0.1'));
              const isExternalLink = url && (url.startsWith('http://') || url.startsWith('https://')) && !isLocalhost;
              
              // Lấy path từ URL nếu là localhost
              let internalPath = url;
              if (isLocalhost && url) {
                try {
                  const urlObj = new URL(url);
                  internalPath = urlObj.pathname;
                } catch (e) {
                  internalPath = url;
                }
              }
              
              return (
                <div
                  key={banner.banner_id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {isExternalLink ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white pointer-events-none">
                        <h3 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm md:text-lg">{banner.description}</p>
                        )}
                      </div>
                    </a>
                  ) : url ? (
                    <Link to={isLocalhost ? internalPath : url} className="block w-full h-full relative">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white pointer-events-none">
                        <h3 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm md:text-lg">{banner.description}</p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white pointer-events-none">
                        <h3 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm md:text-lg">{banner.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-20"
                aria-label="Banner trước"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-20"
                aria-label="Banner tiếp theo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentBannerIndex 
                      ? 'w-8 md:w-10 h-3 md:h-4 bg-white' 
                      : 'w-3 md:w-4 h-3 md:h-4 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Chuyển đến banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};

export default HomePage;