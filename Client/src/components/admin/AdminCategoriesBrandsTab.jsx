import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * @component AdminCategoriesBrandsTab
 * @description Quản lý danh mục và thương hiệu — trích xuất từ AdminDashboard
 * @category Admin
 */

const AdminCategoriesBrandsTab = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState('categories');

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingBrandId, setEditingBrandId] = useState(null);

  // editedItems[id] = { name, description, parent_id, ... }
  const [editedItems, setEditedItems] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.'); return; }
      const headers = { Authorization: `Bearer ${token}` };

      const [cRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories', { headers }),
        axios.get('http://localhost:5000/api/brands', { headers }),
      ]);

      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải dữ liệu. Vui lòng kiểm tra lại server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared helpers ─────────────────────────────────────────────────────────

  const handleChange = (id, field, value) => {
    setEditedItems(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const handleEdit = (type, item) => {
    const id = type === 'categories' ? item.category_id : item.brand_id;
    setEditedItems(prev => ({ ...prev, [id]: { ...item } }));
    if (type === 'categories') setEditingCategoryId(id);
    else setEditingBrandId(id);
  };

  const handleCancelEdit = (type, id) => {
    if (id.toString().includes('new_')) {
      if (type === 'categories') setCategories(prev => prev.filter(c => c.category_id !== id));
      else setBrands(prev => prev.filter(b => b.brand_id !== id));
    }
    if (type === 'categories') setEditingCategoryId(null);
    else setEditingBrandId(null);
    setEditedItems(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleAdd = (type) => {
    const newId = `new_${Date.now()}`;
    if (type === 'categories') {
      const newItem = { category_id: newId, name: '', description: '', parent_id: null };
      setCategories(prev => [newItem, ...prev]);
      handleEdit('categories', newItem);
    } else {
      const newItem = { brand_id: newId, name: '', description: '' };
      setBrands(prev => [newItem, ...prev]);
      handleEdit('brands', newItem);
    }
  };

  const handleSave = async (type, id) => {
    const itemData = editedItems[id];
    if (!itemData) return;

    const isNew = id.toString().includes('new_');
    const apiUrl = `http://localhost:5000/api/${type}` + (isNew ? '' : `/${id}`);
    const apiMethod = isNew ? axios.post : axios.put;
    const idField = type === 'categories' ? 'category_id' : 'brand_id';

    try {
      const token = localStorage.getItem('token');
      const response = await apiMethod(apiUrl, itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newIdFromServer = isNew ? (response.data.id || response.data[idField]) : id;
      const finalItem = { ...itemData, [idField]: newIdFromServer };

      const setter = type === 'categories' ? setCategories : setBrands;
      setter(prev => prev.map(item => (item[idField] === id ? finalItem : item)));

      if (type === 'categories') setEditingCategoryId(null);
      else setEditingBrandId(null);

      setEditedItems(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      setError(err.response?.data?.error || `Không thể lưu ${type === 'categories' ? 'danh mục' : 'thương hiệu'}.`);
      console.error(err);
    }
  };

  const handleDelete = async (type, id) => {
    const label = type === 'categories' ? 'danh mục' : 'thương hiệu';
    if (!window.confirm(`Bạn có chắc muốn xóa ${label} này không?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (type === 'categories') setCategories(prev => prev.filter(c => c.category_id !== id));
      else setBrands(prev => prev.filter(b => b.brand_id !== id));
    } catch (err) {
      setError(err.response?.data?.error || `Không thể xóa ${label}.`);
      console.error(err);
    }
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        <svg className="animate-spin w-6 h-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#22336b]">Danh mục &amp; Thương hiệu</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ danh mục sản phẩm và thương hiệu trong hệ thống.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Sub-tab navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'categories', label: 'Danh mục', count: categories.length },
          { key: 'brands', label: 'Thương hiệu', count: brands.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              subTab === key
                ? 'bg-white text-[#22336b] shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              subTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Categories Tab ── */}
      {subTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{categories.length} danh mục</p>
            <button
              onClick={() => handleAdd('categories')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition text-sm"
            >
              <span className="text-lg leading-none">+</span> Thêm danh mục
            </button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-1/4">Tên danh mục</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-2/5">Mô tả</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-1/5">Danh mục cha</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-1/6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                      Chưa có danh mục nào. Nhấn &quot;+ Thêm danh mục&quot; để bắt đầu.
                    </td>
                  </tr>
                )}
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.category_id;
                  const item = isEditing ? editedItems[category.category_id] || {} : category;
                  return (
                    <tr key={category.category_id} className={`align-top transition-colors ${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      {/* Name */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={e => handleChange(category.category_id, 'name', e.target.value)}
                            placeholder="Tên danh mục"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{item.name}</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <textarea
                            value={item.description || ''}
                            onChange={e => handleChange(category.category_id, 'description', e.target.value)}
                            placeholder="Mô tả danh mục"
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-500 line-clamp-2">{item.description || <em className="text-gray-300">Chưa có mô tả</em>}</span>
                        )}
                      </td>

                      {/* Parent category */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={item.parent_id || ''}
                            onChange={e => handleChange(category.category_id, 'parent_id', e.target.value || null)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          >
                            <option value="">Không có</option>
                            {categories
                              .filter(c => c.category_id !== category.category_id)
                              .map(c => (
                                <option key={c.category_id} value={c.category_id}>{c.name}</option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {categories.find(c => c.category_id === item.parent_id)?.name || (
                              <em className="text-gray-300">Không có</em>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave('categories', category.category_id)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => handleCancelEdit('categories', category.category_id)}
                                className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit('categories', category)}
                                className="bg-yellow-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-500 transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete('categories', category.category_id)}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Brands Tab ── */}
      {subTab === 'brands' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{brands.length} thương hiệu</p>
            <button
              onClick={() => handleAdd('brands')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition text-sm"
            >
              <span className="text-lg leading-none">+</span> Thêm thương hiệu
            </button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-1/4">Tên thương hiệu</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-3/5">Mô tả</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-1/6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400 text-sm">
                      Chưa có thương hiệu nào. Nhấn &quot;+ Thêm thương hiệu&quot; để bắt đầu.
                    </td>
                  </tr>
                )}
                {brands.map((brand) => {
                  const isEditing = editingBrandId === brand.brand_id;
                  const item = isEditing ? editedItems[brand.brand_id] || {} : brand;
                  return (
                    <tr key={brand.brand_id} className={`align-top transition-colors ${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      {/* Name */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={e => handleChange(brand.brand_id, 'name', e.target.value)}
                            placeholder="Tên thương hiệu"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{item.name}</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <textarea
                            value={item.description || ''}
                            onChange={e => handleChange(brand.brand_id, 'description', e.target.value)}
                            placeholder="Mô tả thương hiệu"
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-500 line-clamp-2">{item.description || <em className="text-gray-300">Chưa có mô tả</em>}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave('brands', brand.brand_id)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => handleCancelEdit('brands', brand.brand_id)}
                                className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit('brands', brand)}
                                className="bg-yellow-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-500 transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete('brands', brand.brand_id)}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesBrandsTab;