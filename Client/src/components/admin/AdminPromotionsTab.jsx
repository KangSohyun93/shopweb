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

  // ─── Edit form (shared between card and table) ─────────────────────────────
  const EditForm = ({ promo }) => {
    const item = editedItems[promo.promotion_id] || {};
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Mã khuyến mãi</label>
          <input
            type="text"
            value={item.code || ''}
            onChange={e => handleChange(promo.promotion_id, 'code', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="VD: SUMMER20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
          <textarea
            value={item.description || ''}
            onChange={e => handleChange(promo.promotion_id, 'description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            rows={2}
            placeholder="Mô tả khuyến mãi"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Loại giảm giá</label>
            <select
              value={item.discount_type || 'percentage'}
              onChange={e => handleChange(promo.promotion_id, 'discount_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Cố định ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Giá trị</label>
            <input
              type="number"
              value={item.discount_value || 0}
              min={0}
              onChange={e => handleChange(promo.promotion_id, 'discount_value', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Đơn tối thiểu ($)</label>
          <input
            type="number"
            value={item.min_order_value || 0}
            min={0}
            onChange={e => handleChange(promo.promotion_id, 'min_order_value', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Từ ngày</label>
            <input
              type="datetime-local"
              value={formatDateTime(item.start_date)}
              onChange={e => handleChange(promo.promotion_id, 'start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Đến ngày</label>
            <input
              type="datetime-local"
              value={formatDateTime(item.end_date)}
              onChange={e => handleChange(promo.promotion_id, 'end_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => handleSave(promo.promotion_id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            💾 Lưu
          </button>
          <button
            onClick={() => handleCancelEdit(promo.promotion_id)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Quản lý Khuyến mãi</h2>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-green-700 transition text-sm"
        >
          + Thêm khuyến mãi
        </button>
      </div>

      {/* ── Mobile Card Layout ── */}
      <div className="md:hidden space-y-3">
        {promotions.length === 0 && (
          <div className="text-center text-gray-400 py-12">Không có khuyến mãi nào</div>
        )}
        {promotions.map((promo) => {
          const isEditing = editMode === promo.promotion_id;
          const item = isEditing ? (editedItems[promo.promotion_id] || {}) : promo;

          return (
            <div key={promo.promotion_id} className={`bg-white rounded-xl border shadow-sm p-4 ${isEditing ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
              {isEditing ? (
                <EditForm promo={promo} />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-sm">{item.code}</span>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description || '—'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 font-bold text-sm px-2 py-1 rounded-lg">
                      {item.discount_value}{item.discount_type === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div>
                      <span className="font-semibold text-gray-600 block">Đơn tối thiểu</span>
                      {Number(item.min_order_value || 0).toLocaleString('en-US')} $
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block">Thời gian</span>
                      <p>{item.start_date ? new Date(item.start_date).toLocaleDateString('vi-VN') : '—'}</p>
                      <p>→ {item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end border-t border-gray-100 pt-2">
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
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop Table Layout ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
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

              if (isEditing) {
                return (
                  <tr key={promo.promotion_id} className="bg-blue-50/50">
                    <td colSpan={6} className="p-4">
                      <EditForm promo={promo} />
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={promo.promotion_id} className="hover:bg-gray-50 align-top">
                  {/* Mã */}
                  <td className="py-3 px-4">
                    <strong className="font-mono text-blue-700">{item.code}</strong>
                  </td>

                  {/* Mô tả */}
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{item.description || '—'}</p>
                  </td>

                  {/* Loại / Giá trị */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-semibold text-green-700">{item.discount_value}</span>
                      <span className="text-gray-500 text-xs">
                        {item.discount_type === 'percentage' ? '%' : '$'}
                      </span>
                    </span>
                  </td>

                  {/* Đơn tối thiểu */}
                  <td className="py-3 px-4">
                    <span className="text-sm">
                      {Number(item.min_order_value || 0).toLocaleString('en-US')} $
                    </span>
                  </td>

                  {/* Thời gian */}
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>Từ: {item.start_date ? new Date(item.start_date).toLocaleString('vi-VN') : '—'}</p>
                      <p>Đến: {item.end_date ? new Date(item.end_date).toLocaleString('vi-VN') : '—'}</p>
                    </div>
                  </td>

                  {/* Hành động */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
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