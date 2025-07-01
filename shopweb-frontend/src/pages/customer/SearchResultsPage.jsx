import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../../services/api';
import ProductItem from '../../components/ProductItem';

const SearchResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState('relevance');

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
          let sortedResults = [...validResults];
          if (sortOption === 'price-asc') sortedResults.sort((a, b) => (a.price || 0) - (b.price || 0));
          else if (sortOption === 'price-desc') sortedResults.sort((a, b) => (b.price || 0) - (a.price || 0));
          setResults(sortedResults);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err.response?.data || err.message);
        setError(`Không thể tải kết quả tìm kiếm. Vui lòng thử lại. Chi tiết: ${err.response?.data?.error || err.message}`);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, sortOption]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleNewSearch = (e) => {
    e.preventDefault();
    const newQuery = e.target.elements.search.value.trim();
    if (newQuery && newQuery !== query) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/" className="mb-4 inline-block text-blue-600 hover:underline">Trở về Home</Link>
      <h2 className="text-2xl font-bold mb-6">
        Kết quả tìm kiếm cho: "{query}"
      </h2>

      <form onSubmit={handleNewSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={query}
            className="border rounded-lg px-4 py-2 w-full md:w-1/2"
            placeholder="Nhập từ khóa tìm kiếm..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Tìm kiếm lại
          </button>
        </div>
      </form>

      <div className="mb-6 flex justify-between items-center">
        <span className="text-gray-600">Tổng: {results.length} sản phẩm</span>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="border rounded-lg px-3 py-2"
        >
          <option value="relevance">Sắp xếp theo độ liên quan</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Đang tải...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-center text-gray-600">
          Không tìm thấy sản phẩm nào cho từ khóa "{query}".
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {currentResults.map((product) => (
              <Link
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="block"
              >
                <ProductItem
                  product={product}
                  variants={product.variants || []}
                />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;