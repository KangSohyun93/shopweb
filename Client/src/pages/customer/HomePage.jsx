import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, bannerRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/banners/active')
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setBanners(bannerRes.data || []);

        // 🎯 GỌI API GỢI Ý CÁ NHÂN HÓA
        const sessionId = localStorage.getItem('session_id') || '';
        const token = localStorage.getItem('token');
        
        const recRes = await axios.get('http://localhost:5000/api/recommendations/homepage', {
          headers: { 
            'x-session-id': sessionId,
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        if (recRes.data.success) {
          setPersonalizedProducts(recRes.data.data);
          setIsPersonalized(recRes.data.is_personalized);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc banner hợp lệ: Phải active, nằm trong khoảng ngày
  const getActiveBanners = () => {
    const now = new Date();
    
    return banners
      .filter(banner => {
        // Kiểm tra is_active
        if (!banner.is_active) return false;
        
        // Kiểm tra ngày bắt đầu
        if (banner.start_date) {
          const startDate = new Date(banner.start_date);
          if (now < startDate) return false;
        }
        
        // Kiểm tra ngày kết thúc
        if (banner.end_date) {
          const endDate = new Date(banner.end_date);
          if (now > endDate) return false;
        }
        
        return true;
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

  const activeBanners = getActiveBanners();

  // Auto carousel - nhảy sang banner tiếp theo sau 3 giây
  useEffect(() => {
    if (activeBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeBanners]);

  // Lấy 3 danh mục Gốc: Áo, Quần & Váy, Khác
  const parentCategories = categories.filter(c => !c.parent_id);

  // Debug log
  useEffect(() => {
    console.log('📊 CATEGORIES DEBUG INFO:');
    console.log('Total categories:', categories.length);
    console.log('Parent categories:', parentCategories.length, parentCategories.map(c => ({ id: c.category_id, name: c.name })));
    
    parentCategories.forEach(parent => {
      const children = categories.filter(c => c.parent_id === parent.category_id);
      console.log(`  ${parent.name} (ID ${parent.category_id}): ${children.length} con`, children.map(c => c.name));
    });
  }, [categories, parentCategories]);

  if (loading) return <div className="text-center py-20 mt-16 text-gray-500">Đang tải bộ sưu tập mới nhất...</div>;

  return (
    <>
      {/* BANNER - LẤY TỪ DATABASE (Auto Carousel - 3s) */}
      {activeBanners.length > 0 ? (
        <div className="mt-16 bg-gray-900 text-white overflow-hidden">
          {(() => {
            const banner = activeBanners[currentBannerIndex % activeBanners.length];
            
            const handleBannerClick = () => {
              console.log('Banner clicked:', banner);
              console.log('Link URL:', banner.link_url);
              if (banner.link_url) {
                console.log('Navigating to:', banner.link_url);
                // Check nếu là full URL (http/https) thì dùng window.location.href
                if (banner.link_url.startsWith('http://') || banner.link_url.startsWith('https://')) {
                  window.location.href = banner.link_url;
                } else {
                  // Nếu là relative path (bắt đầu bằng /) thì dùng navigate
                  navigate(banner.link_url);
                }
              } else {
                console.log('No link_url found');
              }
            };
            
            return (
              <div 
                key={banner.id} 
                className="relative cursor-pointer"
                onClick={handleBannerClick}
              >
                {/* Banner với ảnh nền */}
                {banner.image_url ? (
                  <div className="relative h-96 md:h-[500px] transition-opacity duration-500 bg-gray-200">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover animate-fadeIn"
                    />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                    <div className="absolute inset-0 flex items-center">
                      <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{banner.title}</h1>
                        {banner.description && <p className="text-lg text-gray-200 mb-6">{banner.description}</p>}
                        {banner.link_url && (
                          <button 
                            onClick={handleBannerClick}
                            className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition duration-300"
                          >
                            {banner.button_text || 'Xem chi tiết'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback nếu không có ảnh */
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{banner.title}</h1>
                      {banner.description && <p className="text-lg text-gray-300 mb-6">{banner.description}</p>}
                      {banner.link_url && (
                        <button 
                          onClick={handleBannerClick}
                          className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition duration-300"
                        >
                          {banner.button_text || 'Xem chi tiết'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Carousel Indicators - dấu chấm chỉ vị trí banner */}
          {activeBanners.length > 1 && (
            <div className="flex justify-center gap-2 py-4 bg-gray-900" onClick={(e) => e.stopPropagation()}>
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentBannerIndex % activeBanners.length ? 'bg-red-600 w-8' : 'bg-gray-600'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default banner nếu không có banner từ database */
        <div className="mt-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                Khám Phá <span className="text-red-500">Thời Trang</span> Của Bạn
              </h1>
              <p className="text-lg text-gray-300 mb-6">Bộ sưu tập mới nhất với phong cách hiện đại và chất lượng cao</p>
              <Link to="/" className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition duration-300">
                Mua Sắm Ngay
              </Link>
            </div>
            <div className="md:w-1/2 text-center">
              <div className="text-8xl font-extrabold text-gray-700 opacity-20">H&M</div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES GRID - 2x2 LAYOUT */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {parentCategories.slice(0, 4).map(parent => {
            // Lấy ID của Cha và tất cả ID của Con
            const validCategoryIds = [
              parent.category_id.toString(), 
              ...categories.filter(c => c.parent_id === parent.category_id).map(c => c.category_id.toString())
            ];

            // Tìm sản phẩm thuộc nhánh này
            const categoryProducts = products.filter(p => 
              p.category_id && validCategoryIds.includes(p.category_id.toString())
            );

            if (categoryProducts.length === 0) return null;

            return (
              <div key={parent.category_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                {/* Category Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6">
                  <h2 className="text-2xl font-extrabold uppercase tracking-wider text-gray-900">{parent.name}</h2>
                </div>
                
                {/* Products Grid - 4 SẢN PHẨM (2x2) */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {categoryProducts.slice(0, 4).map(product => (
                      <Link key={product.product_id} to={`/products/${product.product_id}`} className="group block">
                        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-3">
                          <img 
                            src={product.primary_image_url} 
                            alt={product.name} 
                            loading="lazy"
                            decoding="async"
                            className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500 animate-fadeIn"
                          />
                        </div>
                        <h3 className="text-xs text-gray-700 font-medium truncate">{product.name}</h3>
                        <p className="text-gray-900 font-semibold mt-1 text-sm">
                          {product.variants?.[0]?.price ? '$' + Number(product.variants[0].price).toLocaleString('en-US') : 'Liên hệ'}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {/* View All Button */}
                  {categoryProducts.length > 4 && (
                    <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
                      <Link 
                        to={`/category/${parent.category_id}`} 
                        className="px-6 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-700 transition duration-300"
                      >
                        Xem tất cả {parent.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSONALIZED RECOMMENDATIONS SECTION */}
      {personalizedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="mb-24">
            <div className="flex justify-between items-end mb-8 border-b pb-4">
              <h2 className="text-3xl font-extrabold uppercase tracking-wider text-gray-900">
                {isPersonalized ? "Dành Riêng Cho Bạn" : "Đang Thịnh Hành"}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {personalizedProducts.map(product => (
                <Link key={product.product_id} to={`/products/${product.product_id}`} className="group block relative">
                  {/* NẾU LÀ HÀNG MỚI CHƯA CÓ LƯỢT MUA - Gắn Badge NEW để thu hút */}
                  {product.total_sold === 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                      NEW
                    </span>
                  )}
                  
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    <img 
                      src={product.primary_image_url} 
                      alt={product.name} 
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500 animate-fadeIn"
                    />
                  </div>
                  <h3 className="text-sm text-gray-700 font-medium truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-red-600 font-bold">
                      {product.price ? '$' + Number(product.price).toLocaleString('en-US') : 'Liên hệ'}
                    </p>
                    <p className="text-xs text-gray-400">Đã bán {product.total_sold || 0}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
