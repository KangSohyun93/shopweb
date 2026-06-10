import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPromotionsTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState(null);
  const [editedItems, setEditedItems] = useState({});
  const [editMode, setEditMode] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.'); return; }
      const res = await axios.get('http://localhost:5000/api/promotions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err.response?.data?.error || 'Không thể tải dữ liệu khuyến mãi.');
    }
  };

  const handleChange = (id, field, value) => {
    setEditedItems(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const handleAdd = () => {
    const newId = `new_${Date.now()}`;
    const newItem = {
      promotion_id: newId,
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      start_date: '',
      end_date: '',
      min_order_value: 0,
    };
    setPromotions(prev => [newItem, ...prev]);
    setEditedItems(prev => ({ ...prev, [newId]: { ...newItem } }));
    setEditMode(newId);
  };

  const handleEdit = (promo) => {
    setEditedItems(prev => ({ ...prev, [promo.promotion_id]: { ...promo } }));
    setEditMode(promo.promotion_id);
  };

  const handleCancelEdit = (id) => {
    if (id.toString().includes('new_')) {
      setPromotions(prev => prev.filter(p => p.promotion_id !== id));
    }
    setEditMode(null);
    setEditedItems(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleSave = async (id) => {
    const itemData = editedItems[id];
    if (!itemData) return;
    const isNew = id.toString().includes('new_');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (isNew) {
        const res = await axios.post('http://localhost:5000/api/promotions', itemData, { headers });
        const newId = res.data.id || res.data.promotion_id;
        setPromotions(prev =>
          prev.map(p => p.promotion_id === id ? { ...itemData, promotion_id: newId } : p)
        );
      } else {
        await axios.put(`http://localhost:5000/api/promotions/${id}`, itemData, { headers });
        setPromotions(prev =>
          prev.map(p => p.promotion_id === id ? { ...itemData } : p)
        );
      }
      setEditMode(null);
      setEditedItems(prev => { const n = { ...prev }; delete n[id]; return n; });
      setError(null);
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError(err.response?.data?.error || 'Không thể lưu khuyến mãi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khuyến mãi này không?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(prev => prev.filter(p => p.promotion_id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError(err.response?.data?.error || 'Không thể xóa khuyến mãi.');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toISOString().slice(0, 16); } catch { return ''; }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Quản lý Khuyến mãi</h2>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-green-700 transition"
        >
          + Thêm khuyến mãi
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Mã</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Mô tả</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Loại / Giá trị</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Đơn tối thiểu</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">Thời gian</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Không có khuyến mãi nào
                </td>
              </tr>
            )}
            {promotions.map((promo) => {
              const isEditing = editMode === promo.promotion_id;
              const item = isEditing ? (editedItems[promo.promotion_id] || {}) : promo;

              return (
                <tr key={promo.promotion_id} className="hover:bg-gray-50 align-top">
                  {/* Mã */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.code || ''}
                        onChange={e => handleChange(promo.promotion_id, 'code', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        placeholder="VD: SUMMER20"
                      />
                    ) : (
                      <strong className="font-mono text-blue-700">{item.code}</strong>
                    )}
                  </td>

                  {/* Mô tả */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <textarea
                        value={item.description || ''}
                        onChange={e => handleChange(promo.promotion_id, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                        rows={2}
                        placeholder="Mô tả khuyến mãi"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{item.description || '—'}</p>
                    )}
                  </td>

                  {/* Loại / Giá trị */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <select
                          value={item.discount_type || 'percentage'}
                          onChange={e => handleChange(promo.promotion_id, 'discount_type', e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                        >
                          <option value="percentage">Phần trăm (%)</option>
                          <option value="fixed">Cố định ($)</option>
                        </select>
                        <input
                          type="number"
                          value={item.discount_value || 0}
                          min={0}
                          onChange={e => handleChange(promo.promotion_id, 'discount_value', e.target.value)}
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                        />
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-green-700">{item.discount_value}</span>
                        <span className="text-gray-500 text-xs">
                          {item.discount_type === 'percentage' ? '%' : 'VND'}
                        </span>
                      </span>
                    )}
                  </td>

                  {/* Đơn tối thiểu */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.min_order_value || 0}
                        min={0}
                        onChange={e => handleChange(promo.promotion_id, 'min_order_value', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                      />
                    ) : (
                      <span className="text-sm">
                        {Number(item.min_order_value || 0).toLocaleString('vi-VN')}$
                      </span>
                    )}
                  </td>

                  {/* Thời gian */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Từ ngày</label>
                          <input
                            type="datetime-local"
                            value={formatDateTime(item.start_date)}
                            onChange={e => handleChange(promo.promotion_id, 'start_date', e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Đến ngày</label>
                          <input
                            type="datetime-local"
                            value={formatDateTime(item.end_date)}
                            onChange={e => handleChange(promo.promotion_id, 'end_date', e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>Từ: {item.start_date ? new Date(item.start_date).toLocaleString('vi-VN') : '—'}</p>
                        <p>Đến: {item.end_date ? new Date(item.end_date).toLocaleString('vi-VN') : '—'}</p>
                      </div>
                    )}
                  </td>

                  {/* Hành động */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(promo.promotion_id)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600"
                          >
                            💾 Lưu
                          </button>
                          <button
                            onClick={() => handleCancelEdit(promo.promotion_id)}
                            className="bg-gray-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-500"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(promo)}
                            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-600"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(promo.promotion_id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600"
                          >
                            🗑️ Xóa
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
  );
};

export default AdminPromotionsTab;