import { useState } from 'react';
import axios from 'axios';

const useUserActions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // ✅ Nhận từng tham số riêng, có page và limit rõ ràng
  const loadUsers = async (q = '', role = '', is_locked = '', is_deleted = '', page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (role) params.append('role', role);
      if (is_locked !== '') params.append('is_locked', is_locked);
      if (is_deleted !== '') params.append('is_deleted', is_deleted);
      params.append('page', page);
      params.append('limit', limit);

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

  const toggleLock = async (userId, currentLocked) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentLocked ? 'mở khoá' : 'khoá'} tài khoản này?`)) return false;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/lock`,
        { is_locked: !currentLocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Lỗi khi cập nhật trạng thái khoá');
      return false;
    }
  };

  const changeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Chuyển vai trò sang ${newRole}?`)) return false;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Lỗi khi thay đổi vai trò');
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xoá người dùng này?')) return false;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xoá người dùng');
      return false;
    }
  };

  const restoreUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Lỗi khi khôi phục người dùng');
      return false;
    }
  };

  return {
    users,
    loading,
    pagination,
    setPagination,
    loadUsers,
    toggleLock,
    changeRole,
    deleteUser,
    restoreUser
  };
};

export default useUserActions;