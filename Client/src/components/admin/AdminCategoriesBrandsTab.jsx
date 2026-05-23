import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * @component AdminCategoriesBrandsTab
 * @description Quản lý danh mục và thương hiệu
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
  const [editedItems, setEditedItems] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [cRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories', { headers }),
        axios.get('http://localhost:5000/api/brands', { headers }),
      ]);

      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    const newId = `new_${Date.now()}`;
    setCategories([...categories, { category_id: newId, name: '' }]);
    setEditingCategoryId(newId);
  };

  const handleAddBrand = () => {
    const newId = `new_${Date.now()}`;
    setBrands([...brands, { brand_id: newId, name: '' }]);
    setEditingBrandId(newId);
  };

  const handleChange = (id, value) => {
    setEditedItems((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditCategory = (category) => {
    setEditedItems((prev) => ({ ...prev, [category.category_id]: category.name }));
    setEditingCategoryId(category.category_id);
  };

  const handleEditBrand = (brand) => {
    setEditedItems((prev) => ({ ...prev, [brand.brand_id]: brand.name }));
    setEditingBrandId(brand.brand_id);
  };

  const handleSaveCategory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const name = editedItems[id];

      if (id.toString().includes('new_')) {
        await axios.post('http://localhost:5000/api/categories', { name }, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/categories/${id}`, { name }, { headers });
      }

      await fetchData();
      setEditingCategoryId(null);
      setEditedItems({});
    } catch (err) {
      setError('Lỗi khi lưu danh mục');
      console.error(err);
    }
  };

  const handleSaveBrand = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const name = editedItems[id];

      if (id.toString().includes('new_')) {
        await axios.post('http://localhost:5000/api/brands', { name }, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/brands/${id}`, { name }, { headers });
      }

      await fetchData();
      setEditingBrandId(null);
      setEditedItems({});
    } catch (err) {
      setError('Lỗi khi lưu thương hiệu');
      console.error(err);
    }
  };

  const handleCancelEditCategory = (id) => {
    if (id.toString().includes('new_')) {
      setCategories((prev) => prev.filter((c) => c.category_id !== id));
    }
    setEditingCategoryId(null);
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[id];
      return newItems;
    });
  };

  const handleCancelEditBrand = (id) => {
    if (id.toString().includes('new_')) {
      setBrands((prev) => prev.filter((b) => b.brand_id !== id));
    }
    setEditingBrandId(null);
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[id];
      return newItems;
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/categories/${id}`, { headers });
      await fetchData();
    } catch (err) {
      setError('Lỗi khi xóa danh mục');
      console.error(err);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thương hiệu này?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/brands/${id}`, { headers });
      await fetchData();
    } catch (err) {
      setError('Lỗi khi xóa thương hiệu');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Danh mục & Thương hiệu</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Sub-tabs */}
      <div className="mb-4 border-b">
        <button
          onClick={() => setSubTab('categories')}
          className={`px-4 py-2 ${subTab === 'categories' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Danh mục
        </button>
        <button
          onClick={() => setSubTab('brands')}
          className={`px-4 py-2 ${subTab === 'brands' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Thương hiệu
        </button>
      </div>

      {/* Categories */}
      {subTab === 'categories' && (
        <div>
          <button
            onClick={handleAddCategory}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Thêm danh mục
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const isEditing = editingCategoryId === category.category_id;
              return (
                <div key={category.category_id} className="border border-gray-300 rounded p-4">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedItems[category.category_id] || ''}
                        onChange={(e) => handleChange(category.category_id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCategory(category.category_id)}
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => handleCancelEditCategory(category.category_id)}
                          className="flex-1 bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold mb-2">{category.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.category_id)}
                          className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      {subTab === 'brands' && (
        <div>
          <button
            onClick={handleAddBrand}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Thêm thương hiệu
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map((brand) => {
              const isEditing = editingBrandId === brand.brand_id;
              return (
                <div key={brand.brand_id} className="border border-gray-300 rounded p-4">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedItems[brand.brand_id] || ''}
                        onChange={(e) => handleChange(brand.brand_id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveBrand(brand.brand_id)}
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => handleCancelEditBrand(brand.brand_id)}
                          className="flex-1 bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold mb-2">{brand.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.brand_id)}
                          className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesBrandsTab;
