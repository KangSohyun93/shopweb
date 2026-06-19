import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';

/**
 * @component AdminProductsTab
 * @description Quản lý sản phẩm – Bảng dữ liệu chuyên nghiệp với rowSpan cho biến thể
 * @category Admin
 */

// ─── Sub-components khai báo NGOÀI AdminProductsTab ───────────────────────────
// (Tránh mất focus input — nếu khai báo trong component cha, React unmount/remount mỗi render)

const ColorDot = ({ color }) => (
  <span
    className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
    style={{ backgroundColor: color && color !== 'default' ? color : '#e5e7eb' }}
  />
);

const StockBadge = ({ qty }) => {
  const n = parseInt(qty) || 0;
  if (n === 0) return <span className="text-red-500 font-semibold">{n}</span>;
  if (n < 5)  return <span className="text-amber-500 font-semibold">{n}</span>;
  return <span className="text-green-600 font-semibold">{n}</span>;
};

const EditRow = ({
  product,
  editedItems,
  categories,
  brands,
  handleChange,
  handleCancelEdit,
  handleSaveProduct,
  handleVariantChange,
  handleAddVariant,
  handleRemoveVariant,
  handleImageUpload,
  handleAdditionalImageDelete,
}) => {
  const id = product.product_id;
  const edited = editedItems[id] || product;

  return (
    <tr>
      <td colSpan={12} className="p-0">
        <div className="m-3 rounded-xl border border-blue-200 bg-blue-50 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200">
            <h4 className="text-base font-bold text-gray-800">
              {String(id).includes('new_') ? '➕ Thêm sản phẩm mới' : `✏️ Chỉnh sửa: ${product.name}`}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleCancelEdit(id)}
                className="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveProduct(id)}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                💾 Lưu thay đổi
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* ── Thông tin cơ bản ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin cơ bản</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={edited.name || ''}
                    onChange={e => handleChange(id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    placeholder="Tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Danh mục *</label>
                  <select
                    value={edited.category_id || ''}
                    onChange={e => handleChange(id, 'category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Thương hiệu *</label>
                  <select
                    value={edited.brand_id || ''}
                    onChange={e => handleChange(id, 'brand_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label>
                  <textarea
                    value={edited.description || ''}
                    onChange={e => handleChange(id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    rows={2}
                    placeholder="Mô tả chi tiết sản phẩm"
                  />
                </div>
              </div>
            </div>

            {/* ── Biến thể ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Biến thể sản phẩm</p>
                <button
                  onClick={() => handleAddVariant(id)}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  + Thêm biến thể
                </button>
              </div>

              {(!edited.variants || edited.variants.length === 0) && (
                <p className="text-sm text-gray-400 italic">Chưa có biến thể. Nhấn "+ Thêm biến thể" để tạo.</p>
              )}

              <div className="space-y-3">
                {(edited.variants || []).map((variant, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">Biến thể #{idx + 1}</span>
                      {edited.variants.length > 1 && (
                        <button
                          onClick={() => handleRemoveVariant(id, idx)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: 'SKU', field: 'sku', type: 'text', placeholder: 'SKU-001' },
                        { label: 'Màu sắc', field: 'color', type: 'text', placeholder: 'red, #FF0000…' },
                        { label: 'Kích cỡ', field: 'size', type: 'text', placeholder: 'S, M, L, 42…' },
                        { label: 'Giá (VND) *', field: 'price', type: 'number', placeholder: '0', min: 0 },
                        { label: 'Tồn kho *', field: 'stock_quantity', type: 'number', placeholder: '0', min: 0 },
                        { label: 'Khối lượng (g)', field: 'weight', type: 'number', placeholder: '500', min: 0 },
                      ].map(({ label, field, type, placeholder, min }) => (
                        <div key={field}>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">{label}</label>
                          <input
                            type={type}
                            value={variant[field] ?? ''}
                            min={min}
                            onChange={e => {
                              let val = e.target.value;
                              if (type === 'number') val = val === '' ? '' : field === 'stock_quantity' ? parseInt(val) : parseFloat(val);
                              handleVariantChange(id, idx, field, val);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-300 focus:outline-none"
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Quản lý ảnh ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quản lý ảnh</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Ảnh chính</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files[0]) handleImageUpload(id, e.target.files[0], 'upload-primary-image', 'primary_image_url');
                    }}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2"
                  />
                  {edited.primary_image_url && (
                    <img src={edited.primary_image_url} alt="Primary" className="mt-3 w-24 h-24 object-cover rounded-lg border" />
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Ảnh phụ (Có thể chọn nhiều)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => {
                      Array.from(e.target.files || []).forEach(file =>
                        handleImageUpload(id, file, 'upload-additional-image', 'additional_images', true)
                      );
                    }}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2"
                  />
                  {(edited.additional_images || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {edited.additional_images.map(img => (
                        <div key={img.image_id} className="relative">
                          <img src={img.image_url} alt="Additional" className="w-16 h-16 object-cover rounded-lg border" />
                          <button
                            onClick={() => handleAdditionalImageDelete(id, img.image_id)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTotalStock = (variants) => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
};

const getPriceRange = (variants) => {
  if (!variants || variants.length === 0) return '0';
  const prices = variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
  if (prices.length === 0) return '0';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return min.toLocaleString('vi-VN');
  return `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}`;
};

// ─── Main component ────────────────────────────────────────────────────────────
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
  const [expandedRows, setExpandedRows] = useState({});

  const toggleMobileExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); }, []);

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

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleAddProduct = () => {
    const newId = `new_${Date.now()}`;
    const newProduct = {
      product_id: newId,
      name: '',
      description: '',
      category_id: '',
      brand_id: '',
      primary_image_url: '',
      variants: [{ sku: '', color: 'default', size: 'one-size', price: 0, stock_quantity: 0, weight: '' }],
    };
    setProducts(prev => [newProduct, ...prev]);
    setEditMode(newId);
    setEditedItems(prev => ({ ...prev, [newId]: { ...newProduct } }));
    setCurrentPage(1);
  };

  const handleChange = (id, field, value) =>
    setEditedItems(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));

  const handleEdit = (product) => {
    setEditedItems(prev => ({
      ...prev,
      [product.product_id]: { ...product, variants: (product.variants || []).map(v => ({ ...v })) },
    }));
    setEditMode(product.product_id);
  };

  const handleCancelEdit = (id) => {
    if (String(id).includes('new_')) {
      setProducts(prev => prev.filter(p => p.product_id !== id));
    }
    setEditMode(null);
    setEditedItems(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleSaveProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const data = editedItems[id];
      if (String(id).includes('new_')) {
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
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // ─── Variants ─────────────────────────────────────────────────────────────
  const handleVariantChange = (productId, idx, field, value) => {
    const variants = [...(editedItems[productId]?.variants || [])];
    variants[idx] = { ...variants[idx], [field]: value };
    handleChange(productId, 'variants', variants);
  };

  const handleAddVariant = (productId) => {
    const variants = [...(editedItems[productId]?.variants || [])];
    variants.push({ sku: '', color: 'default', size: 'one-size', price: 0, stock_quantity: 0, weight: '' });
    handleChange(productId, 'variants', variants);
  };

  const handleRemoveVariant = (productId, idx) => {
    const variants = [...(editedItems[productId]?.variants || [])];
    variants.splice(idx, 1);
    handleChange(productId, 'variants', variants);
  };

  // ─── Images ───────────────────────────────────────────────────────────────
  const handleImageUpload = async (productId, file, endpoint, field, isMultiple = false) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/products/${endpoint}/${productId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (isMultiple) {
        handleChange(productId, field, [...(editedItems[productId]?.[field] || []), response.data]);
      } else {
        handleChange(productId, field, response.data.image_url);
      }
    } catch (err) {
      setError('Lỗi khi upload ảnh');
      console.error(err);
    }
  };

  const handleAdditionalImageDelete = async (productId, imageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/delete-additional-image/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleChange(productId, 'additional_images',
        (editedItems[productId]?.additional_images || []).filter(img => img.image_id !== imageId)
      );
    } catch (err) {
      setError('Lỗi khi xóa ảnh');
      console.error(err);
    }
  };

  // ─── Checkbox ─────────────────────────────────────────────────────────────
  const toggleSelectProduct = (id) =>
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    const pageIds = currentProducts.map(p => p.product_id);
    const allSelected = pageIds.every(id => selectedProducts.includes(id));
    if (allSelected) {
      setSelectedProducts(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedProducts(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  // ─── Filter + paginate ────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat   = !filterCategory || p.category_id === parseInt(filterCategory);
    const matchBrand = !filterBrand    || p.brand_id    === parseInt(filterBrand);
    return matchSearch && matchCat && matchBrand;
  });

  const totalPages      = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const pageIds        = currentProducts.map(p => p.product_id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedProducts.includes(id));

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Quản lý Sản phẩm</h2>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* ── Bộ lọc ── */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        <select
          value={filterBrand}
          onChange={e => { setFilterBrand(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
        </select>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Thêm sản phẩm
        </button>
        <div className="text-sm text-gray-500 py-2 text-right">
          Tổng: <span className="font-semibold text-gray-700">{filteredProducts.length}</span> sản phẩm
        </div>
      </div>

      {/* ── Bulk delete bar ── */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">
          <span className="text-sm font-semibold text-amber-800">
            {selectedProducts.length} sản phẩm được chọn
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium"
          >
            🗑️ Xóa được chọn
          </button>
        </div>
      )}

      {/* ── Data Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-center w-10 hidden md:table-cell">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  title="Chọn tất cả trang này"
                />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 min-w-[200px]">Sản phẩm</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 min-w-[110px] hidden md:table-cell">Danh mục</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 min-w-[110px] hidden md:table-cell">Thương hiệu</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 w-28 hidden md:table-cell">Mã SKU</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 w-24 hidden md:table-cell">Màu sắc</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 w-20 hidden md:table-cell">Cỡ</th>
              <th className="px-3 py-3 text-right font-semibold text-gray-600 w-32 hidden md:table-cell">Giá (VND)</th>
              <th className="px-3 py-3 text-right font-semibold text-gray-600 w-20 hidden md:table-cell">Kho</th>
              <th className="px-3 py-3 text-right font-semibold text-gray-600 w-24 hidden md:table-cell">KL (g)</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-600 w-24 hidden md:table-cell">Thao tác</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-600 w-16 md:hidden">Xem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentProducts.length === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-400">
                  Không có sản phẩm nào
                </td>
              </tr>
            )}

            {currentProducts.map(product => {
              const isEditing   = editMode === product.product_id;
              const variants    = product.variants || [];
              const rowCount    = variants.length || 1;
              const categoryName = categories.find(c => c.category_id === product.category_id)?.name || '—';
              const brandName    = brands.find(b => b.brand_id === product.brand_id)?.name || '—';
              const isSelected  = selectedProducts.includes(product.product_id);
              const rowBg       = isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50';

              return (
                <React.Fragment key={product.product_id}>
                  {/* Edit form row */}
                  {isEditing && (
                    <EditRow
                      product={product}
                      editedItems={editedItems}
                      categories={categories}
                      brands={brands}
                      handleChange={handleChange}
                      handleCancelEdit={handleCancelEdit}
                      handleSaveProduct={handleSaveProduct}
                      handleVariantChange={handleVariantChange}
                      handleAddVariant={handleAddVariant}
                      handleRemoveVariant={handleRemoveVariant}
                      handleImageUpload={handleImageUpload}
                      handleAdditionalImageDelete={handleAdditionalImageDelete}
                    />
                  )}

                  {/* Data rows – one per variant */}
                  {!isEditing && (variants.length > 0 ? variants : [null]).map((variant, vIdx) => (
                    <tr key={vIdx} className={`${rowBg} transition-colors ${vIdx > 0 ? 'hidden md:table-row' : ''}`}>

                      {/* ── Shared cells (rowSpan) ── */}
                      {vIdx === 0 && (
                        <>
                          {/* Checkbox */}
                          <td rowSpan={rowCount} className="px-3 py-3 text-center align-middle border-r border-gray-100 hidden md:table-cell">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProduct(product.product_id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>

                          {/* Sản phẩm */}
                          <td rowSpan={rowCount} className="px-3 py-3 align-middle border-r border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {product.primary_image_url ? (
                                  <img
                                    src={product.primary_image_url}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-lg">
                                    📦
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="inline-block text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mb-1 select-all cursor-text">
                                  #{product.product_id}
                                </span>
                                <p className="font-semibold text-gray-800 leading-tight line-clamp-2">
                                  {product.name || <span className="text-gray-400 italic">Chưa đặt tên</span>}
                                </p>
                                {variants.length > 1 && (
                                  <p className="text-xs text-gray-400 mt-0.5 hidden md:block">{variants.length} biến thể</p>
                                )}
                                {/* Mobile range details */}
                                <div className="md:hidden mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                  <span className="text-gray-500 font-medium">Giá: <strong className="text-blue-600 font-semibold">{getPriceRange(product.variants)} đ</strong></span>
                                  <span className="text-gray-500 font-medium">Kho: <strong className="text-green-600 font-semibold">{getTotalStock(product.variants)}</strong></span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Danh mục */}
                          <td rowSpan={rowCount} className="px-3 py-3 align-middle border-r border-gray-100 hidden md:table-cell">
                            <span className="inline-block text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                              {categoryName}
                            </span>
                          </td>

                          {/* Thương hiệu */}
                          <td rowSpan={rowCount} className="px-3 py-3 align-middle border-r border-gray-100 hidden md:table-cell">
                            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {brandName}
                            </span>
                          </td>
                        </>
                      )}

                      {/* ── Per-variant cells ── */}
                      {variant ? (
                        <>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 hidden md:table-cell">
                            <span className="font-mono text-xs text-gray-600">{variant.sku || '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 hidden md:table-cell">
                            <span className="inline-flex items-center gap-1.5">
                              <ColorDot color={variant.color} />
                              <span className="text-xs text-gray-600">
                                {variant.color && variant.color !== 'default' ? variant.color : '—'}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 text-xs text-gray-700 hidden md:table-cell">
                            {variant.size || '—'}
                          </td>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 text-right text-blue-600 font-medium text-xs hidden md:table-cell">
                            {parseFloat(variant.price || 0).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 text-right text-xs hidden md:table-cell">
                            <StockBadge qty={variant.stock_quantity} />
                          </td>
                          <td className="px-3 py-2.5 align-middle border-r border-gray-100 text-right text-xs text-gray-500 hidden md:table-cell">
                            {variant.weight != null && variant.weight !== '' ? variant.weight : '—'}
                          </td>
                        </>
                      ) : (
                        <td colSpan={6} className="px-3 py-2.5 align-middle border-r border-gray-100 text-xs text-gray-400 italic hidden md:table-cell">
                          Chưa có biến thể
                        </td>
                      )}

                      {/* ── Actions (first row only) ── */}
                      {vIdx === 0 && (
                        <>
                          <td rowSpan={rowCount} className="px-3 py-3 align-middle text-center hidden md:table-cell">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button
                                onClick={() => handleEdit(product)}
                                disabled={isEditing}
                                className="w-full px-2 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.product_id)}
                                className="w-full px-2 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 font-medium"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>

                          {/* Mobile toggle button */}
                          <td rowSpan={rowCount} className="px-3 py-3 align-middle text-center md:hidden">
                            <button
                              onClick={() => toggleMobileExpand(product.product_id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Xem chi tiết biến thể"
                            >
                              {expandedRows[product.product_id] ? (
                                <svg className="w-5 h-5 transform rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}

                  {/* Mobile details collapse panel */}
                  {!isEditing && expandedRows[product.product_id] && (
                    <tr className="md:hidden bg-gray-50/70 border-b border-gray-200">
                      <td colSpan={12} className="p-4">
                        <div className="space-y-4">
                          {/* Phân loại summary */}
                          <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-gray-150 text-xs">
                            <div>
                              <span className="font-semibold text-gray-500 block mb-0.5">Danh mục</span>
                              <span className="inline-block text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded font-medium">
                                {categoryName}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 block mb-0.5">Thương hiệu</span>
                              <span className="inline-block text-gray-600 bg-gray-100 px-2.5 py-1 rounded font-medium">
                                {brandName}
                              </span>
                            </div>
                          </div>

                          {/* Variants list */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-700 block">Danh sách biến thể ({variants.length})</span>
                            {variants.length > 0 && variants[0] ? (
                              <div className="divide-y divide-gray-150 bg-white rounded-lg border border-gray-150 overflow-hidden shadow-sm">
                                {variants.map((v, idx) => (
                                  <div key={idx} className="p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-mono text-xs font-bold text-gray-700">SKU: {v.sku || '—'}</span>
                                      <span className="text-sm font-bold text-blue-600">{parseFloat(v.price || 0).toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span className="flex items-center gap-1.5">
                                        Màu: <ColorDot color={v.color} /> {v.color && v.color !== 'default' ? v.color : '—'}
                                        <span className="text-gray-300">|</span> 
                                        Cỡ: {v.size || '—'}
                                      </span>
                                      <span>
                                        Kho: <StockBadge qty={v.stock_quantity} />
                                      </span>
                                    </div>
                                    {v.weight != null && v.weight !== '' && (
                                      <div className="text-[10px] text-gray-400 mt-1">Cân nặng: {v.weight}g</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Chưa có biến thể</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 justify-end pt-2 border-t border-gray-150">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 font-bold shadow-sm flex items-center gap-1"
                            >
                              ✏️ Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.product_id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 font-bold shadow-sm flex items-center gap-1"
                            >
                              🗑️ Xóa sản phẩm
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Trang <span className="font-semibold">{currentPage}</span> / {totalPages}
            {' · '}
            {filteredProducts.length} sản phẩm
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="px-2 py-1.5 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      p === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsTab;