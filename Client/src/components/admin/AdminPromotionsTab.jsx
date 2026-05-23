import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * @component AdminPromotionsTab
 * @description Quản lý khuyến mãi/mã giảm giá
 * @category Admin
 */

const AdminPromotionsTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editedItems, setEditedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/promotions', { headers });
      setPromotions(res.data || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách khuyến mãi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = () => {
    const newId = `new_${Date.now()}`;
    const newPromotion = {
      promotion_id: newId,
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      valid_from: '',
      valid_to: '',
      max_uses: 0,
      times_used: 0,
      min_order_value: 0,
      is_active: true,
    };
    setPromotions([...promotions, newPromotion]);
    setEditMode(newId);
  };

  const handleChange = (id, field, value) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleEdit = (promotion) => {
    setEditedItems((prev) => ({
      ...prev,
      [promotion.promotion_id]: { ...promotion },
    }));
    setEditMode(promotion.promotion_id);
  };

  const handleCancelEdit = (id) => {
    if (id.toString().includes('new_')) {
      setPromotions((prev) => prev.filter((p) => p.promotion_id !== id));
    }
    setEditMode(null);
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[id];
      return newItems;
    });
  };

  const handleSavePromotion = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const data = editedItems[id];

      if (id.toString().includes('new_')) {
        await axios.post('http://localhost:5000/api/promotions', data, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/promotions/${id}`, data, { headers });
      }

      await fetchPromotions();
      setEditMode(null);
      setEditedItems({});
    } catch (err) {
      setError('Lỗi khi lưu khuyến mãi');
      console.error(err);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa khuyến mãi này?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/promotions/${id}`, { headers });
      await fetchPromotions();
    } catch (err) {
      setError('Lỗi khi xóa khuyến mãi');
      console.error(err);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPromotions = promotions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(promotions.length / itemsPerPage);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Khuyến mãi</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <button
        onClick={handleAddPromotion}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Thêm khuyến mãi
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Mã</th>
              <th className="border p-2">Loại giảm</th>
              <th className="border p-2">Giá trị</th>
              <th className="border p-2">Hạn sử dụng</th>
              <th className="border p-2">Lần dùng</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentPromotions.map((promo) => {
              const isEditing = editMode === promo.promotion_id;
              const edited = editedItems[promo.promotion_id];

              return (
                <tr key={promo.promotion_id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={edited?.code || ''}
                        onChange={(e) => handleChange(promo.promotion_id, 'code', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      promo.code
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <select
                        value={edited?.discount_type || ''}
                        onChange={(e) => handleChange(promo.promotion_id, 'discount_type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                      </select>
                    ) : (
                      promo.discount_type === 'percentage' ? '%' : '$'
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={edited?.discount_value || 0}
                        onChange={(e) => handleChange(promo.promotion_id, 'discount_value', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      promo.discount_value
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="date"
                        value={edited?.valid_to || ''}
                        onChange={(e) => handleChange(promo.promotion_id, 'valid_to', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      promo.valid_to?.split('T')[0] || '—'
                    )}
                  </td>
                  <td className="border p-2">{promo.times_used}/{promo.max_uses}</td>
                  <td className="border p-2">
                    {isEditing ? (
                      <select
                        value={edited?.is_active ? 'yes' : 'no'}
                        onChange={(e) => handleChange(promo.promotion_id, 'is_active', e.target.value === 'yes')}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="yes">Hoạt động</option>
                        <option value="no">Tắt</option>
                      </select>
                    ) : (
                      <span className={promo.is_active ? 'text-green-600' : 'text-red-600'}>
                        {promo.is_active ? 'Hoạt động' : 'Tắt'}
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSavePromotion(promo.promotion_id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => handleCancelEdit(promo.promotion_id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(promo)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeletePromotion(promo.promotion_id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>Trang {currentPage} / {totalPages || 1}</div>
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

export default AdminPromotionsTab;
