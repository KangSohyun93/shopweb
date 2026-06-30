import { useState } from 'react';
import axios from 'axios';

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    role: user.role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${user.user_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật người dùng thành công');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.error || 'Lỗi khi cập nhật người dùng');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-0">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              className="w-full border rounded px-3 py-2"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Họ"
              className="w-full border rounded px-3 py-2"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tên"
              className="w-full border rounded px-3 py-2"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="w-full border rounded px-3 py-2"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Cập nhật
            </button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded hover:bg-gray-50">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
