import { useState } from 'react';
import axios from 'axios';

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Tạo người dùng thành công');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || 'Lỗi khi tạo người dùng');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Tạo người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Username *"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email *"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Mật khẩu *"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              Tạo
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

export default CreateUserModal;
