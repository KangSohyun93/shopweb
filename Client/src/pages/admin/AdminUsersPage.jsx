import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    is_locked: '',
    is_deleted: '',
    q: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await axios.get(`http://localhost:5000/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleToggleLock = async (userId, currentLocked) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentLocked ? 'mở khoá' : 'khoá'} tài khoản này?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/lock`,
        { is_locked: !currentLocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadUsers();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Lỗi khi cập nhật trạng thái khoá');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Chuyển vai trò sang ${newRole}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Lỗi khi thay đổi vai trò');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xoá người dùng này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xoá người dùng');
    }
  };

  const handleRestore = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Lỗi khi khôi phục người dùng');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border rounded px-3 py-2"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="border rounded px-3 py-2"
              value={filters.is_locked}
              onChange={(e) => handleFilterChange('is_locked', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="false">Hoạt động</option>
              <option value="true">Đã khoá</option>
            </select>
            <select
              className="border rounded px-3 py-2"
              value={filters.is_deleted}
              onChange={(e) => handleFilterChange('is_deleted', e.target.value)}
            >
              <option value="false">Chưa xoá</option>
              <option value="true">Đã xoá</option>
            </select>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tạo người dùng mới
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Đang tải...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user.user_id} className={user.is_deleted ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">{user.user_id}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.first_name} {user.last_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_deleted ? (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Đã xoá</span>
                      ) : user.is_locked ? (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Đã khoá</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Hoạt động</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.is_deleted ? (
                          <button
                            onClick={() => handleRestore(user.user_id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Khôi phục
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleToggleLock(user.user_id, user.is_locked)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm"
                            >
                              {user.is_locked ? 'Mở khoá' : 'Khoá'}
                            </button>
                            <button
                              onClick={() => handleChangeRole(user.user_id, user.role)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              Đổi role
                            </button>
                            <button
                              onClick={() => handleDelete(user.user_id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xoá
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modals would go here */}
      {showCreateModal && <CreateUserModal onClose={() => { setShowCreateModal(false); loadUsers(); }} />}
      {showEditModal && <EditUserModal user={selectedUser} onClose={() => { setShowEditModal(false); setSelectedUser(null); loadUsers(); }} />}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose }) => {
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

// Edit User Modal Component
const EditUserModal = ({ user, onClose }) => {
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
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.error || 'Lỗi khi cập nhật người dùng');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>
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

export default AdminUsersPage;
