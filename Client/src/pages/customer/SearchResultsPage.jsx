import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../../services/api';
import ProductItem from '../../components/ProductItem';

const SearchResultsPage = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setError('Không có từ khóa tìm kiếm.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchProducts(query);
        console.log('Search API response:', response.data);
        const validResults = Array.isArray(response.data) ? response.data : [];
        if (validResults.length === 0) {
          setError(`Không tìm thấy sản phẩm nào cho từ khóa "${query}".`);
        } else {
          setResults(validResults);
          
          // Extract unique categories and brands
          const categories = [...new Set(validResults.map(p => p.category_name).filter(Boolean))];
          const brands = [...new Set(validResults.map(p => p.brand_name).filter(Boolean))];
          setAvailableCategories(categories);
          setAvailableBrands(brands);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err.response?.data || err.message);
        setError(`Không thể tải kết quả tìm kiếm. Vui lòng thử lại. Chi tiết: ${err.response?.data?.error || err.message}`);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results];

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category_name));
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand_name));
    }

    // Filter by price range
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(p => {
        const price = p.price || 0;
        const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
        const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
        return price >= min && price <= max;
      });
    }

    // Sort
    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === 'name-asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }

    setFilteredResults(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [results, selectedCategories, selectedBrands, priceRange, sortOption]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setSortOption('relevance');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 md:py-8 px-4 mt-14 md:mt-16">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Trở về Trang chủ
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Kết quả tìm kiếm: "{query}"
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 flex items-center justify-between font-semibold"
            >
              <span>🔍 Bộ lọc</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filters Panel */}
            <div className={`bg-white rounded-lg shadow-md p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Clear Filters */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="font-bold text-lg">Bộ lọc</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">💰 Khoảng giá</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceRangeChange}
                    placeholder="Giá tối thiểu"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceRangeChange}
                    placeholder="Giá tối đa"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">📂 Danh mục</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.map(category => (
                      <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">🏷️ Thương hiệu</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min || priceRange.max) && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Đang lọc:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {cat}
                        <button onClick={() => handleCategoryToggle(cat)} className="hover:text-blue-900">×</button>
                      </span>
                    ))}
                    {selectedBrands.map(brand => (
                      <span key={brand} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {brand}
                        <button onClick={() => handleBrandToggle(brand)} className="hover:text-green-900">×</button>
                      </span>
                    ))}
                    {(priceRange.min || priceRange.max) && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {priceRange.min || '0'} - {priceRange.max || '∞'}
                        <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-yellow-900">×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-gray-700">
                <span className="font-semibold">{filteredResults.length}</span> sản phẩm 
                {results.length !== filteredResults.length && (
                  <span className="text-sm text-gray-500"> (từ {results.length} kết quả)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Liên quan nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="name-asc">Tên: A → Z</option>
                  <option value="name-desc">Tên: Z → A</option>
                </select>
              </div>
            </div>

            {/* Products Grid or Empty State */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tìm kiếm...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-4">
                  {results.length > 0 
                    ? 'Không có sản phẩm nào phù hợp với bộ lọc của bạn.'
                    : `Không tìm thấy kết quả cho "${query}"`
                  }
                </p>
                {results.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {currentResults.map((product) => (
                    <Link
                      key={product.product_id}
                      to={`/products/${product.product_id}`}
                      className="block transform transition hover:scale-105"
                    >
                      <ProductItem
                        product={product}
                        variants={product.variants || []}
                      />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium"
                      >
                        ← Trước
                      </button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg font-medium transition ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium"
                      >
                        Sau →
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;