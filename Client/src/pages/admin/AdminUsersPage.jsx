import React, { useState, useEffect } from 'react';
import UserFilters from '../../components/admin/UserFilters';
import AdminUsersTable from '../../components/admin/AdminUsersTable';
import CreateUserModal from '../../components/admin/CreateUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import useUserActions from '../../hooks/useUserActions';

const AdminUsersPage = () => {
  const [filters, setFilters] = useState({
    role: '',
    is_locked: '',
    is_deleted: '',
    q: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { users, loading, pagination, setPagination, loadUsers, toggleLock, changeRole, deleteUser, restoreUser } = useUserActions();

  const reload = (currentFilters = filters, page = pagination.page) => {
    loadUsers(currentFilters.q, currentFilters.role, currentFilters.is_locked, currentFilters.is_deleted, page);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.role, filters.is_locked, filters.is_deleted, pagination.page]);

  // ✅ Đặt TRONG component
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers(newFilters.q, newFilters.role, newFilters.is_locked, newFilters.is_deleted, 1);
  };

  const handleToggleLock = async (userId, currentLocked) => {
    const success = await toggleLock(userId, currentLocked);
    if (success) reload();
  };

  const handleChangeRole = async (userId, currentRole) => {
    const success = await changeRole(userId, currentRole);
    if (success) reload();
  };

  const handleDelete = async (userId) => {
    const success = await deleteUser(userId);
    if (success) reload();
  };

  const handleRestore = async (userId) => {
    const success = await restoreUser(userId);
    if (success) reload();
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <AdminUsersTable
          users={users}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePageChange}
          onEdit={handleEditClick}
          onToggleLock={handleToggleLock}
          onChangeRole={handleChangeRole}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => reload()}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => reload()}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;