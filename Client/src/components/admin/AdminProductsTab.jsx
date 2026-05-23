import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import ProductImageManager from './ProductImageManager';

/**
 * @component AdminProductsTab
 * @description Quản lý sản phẩm (CRUD + variants + images)
 * @category Admin
 */

const AdminProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  const [editMode, setEditMode] = useState(null);
  const [editedItems, setEditedItems] = useState({});
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [pRes, cRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products', { headers }),
        axios.get('http://localhost:5000/api/categories', { headers }),
        axios.get('http://localhost:5000/api/brands', { headers }),
      ]);

      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    const newId = `new_${Date.now()}`;
    const newProduct = {
      product_id: newId,
      name: '',
      description: '',
      category_id: '',
      brand_id: '',
      primary_image_url: '',
      variants: [],
    };
    setProducts([...products, newProduct]);
    setEditMode(newId);
  };

  const handleChange = (id, field, value) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleEdit = (product) => {
    setEditedItems((prev) => ({
      ...prev,
      [product.product_id]: { ...product },
    }));
    setEditMode(product.product_id);
    setExpandedProductId(product.product_id);
  };

  const handleCancelEdit = (id) => {
    if (id.toString().includes('new_')) {
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    }
    setEditMode(null);
    setExpandedProductId(null);
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[id];
      return newItems;
    });
  };

  const handleSaveProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const data = editedItems[id];

      if (id.toString().includes('new_')) {
        await axios.post('http://localhost:5000/api/products', data, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/products/${id}`, data, { headers });
      }

      await fetchProducts();
      setEditMode(null);
      setEditedItems({});
    } catch (err) {
      setError('Lỗi khi lưu sản phẩm');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/products/${id}`, { headers });
      await fetchProducts();
    } catch (err) {
      setError('Lỗi khi xóa sản phẩm');
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) return;
    if (!window.confirm(`Xóa ${selectedProducts.length} sản phẩm?`)) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      for (const id of selectedProducts) {
        await axios.delete(`http://localhost:5000/api/products/${id}`, { headers });
      }

      await fetchProducts();
      setSelectedProducts([]);
    } catch (err) {
      setError('Lỗi khi xóa sản phẩm');
      console.error(err);
    }
  };

  // Filter products
  let filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category_id === parseInt(filterCategory);
    const matchesBrand = !filterBrand || p.brand_id === parseInt(filterBrand);
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Sản phẩm</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded"
        />

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterBrand}
          onChange={(e) => {
            setFilterBrand(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b.brand_id} value={b.brand_id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Bulk delete */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-yellow-50 p-3 rounded">
          <span>{selectedProducts.length} sản phẩm được chọn</span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Xóa được chọn
          </button>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(currentProducts.map((p) => p.product_id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Danh mục</th>
              <th className="border p-2">Thương hiệu</th>
              <th className="border p-2">Giá (variant)</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => {
              const isEditing = editMode === product.product_id;
              const edited = editedItems[product.product_id];
              const isExpanded = expandedProductId === product.product_id;

              return (
                <React.Fragment key={product.product_id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.product_id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter((id) => id !== product.product_id));
                          }
                        }}
                      />
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={edited?.name || ''}
                          onChange={(e) => handleChange(product.product_id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <select
                          value={edited?.category_id || ''}
                          onChange={(e) => handleChange(product.product_id, 'category_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="">-- Chọn --</option>
                          {categories.map((c) => (
                            <option key={c.category_id} value={c.category_id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        categories.find((c) => c.category_id === product.category_id)?.name || '—'
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <select
                          value={edited?.brand_id || ''}
                          onChange={(e) => handleChange(product.product_id, 'brand_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="">-- Chọn --</option>
                          {brands.map((b) => (
                            <option key={b.brand_id} value={b.brand_id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        brands.find((b) => b.brand_id === product.brand_id)?.name || '—'
                      )}
                    </td>
                    <td className="border p-2">
                      {product.variants?.[0]?.price ? `$${product.variants[0].price}` : '—'}
                    </td>
                    <td className="border p-2 text-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveProduct(product.product_id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => handleCancelEdit(product.product_id)}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => setExpandedProductId(isExpanded ? null : product.product_id)}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-sm hover:bg-purple-600"
                          >
                            📸 Ảnh
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* EXPANDED IMAGE MANAGER */}
                  {isExpanded && !isEditing && (
                    <tr>
                      <td colSpan="6" className="border p-6 bg-gray-50">
                        <ProductImageManager
                          product={product}
                          onImageUpdate={() => {
                            fetchProducts();
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Trang {currentPage} / {totalPages || 1}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsTab;
