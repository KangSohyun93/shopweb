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

  useEffect(() => {
    loadUsers(filters);
  }, [filters, pagination.page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleToggleLock = async (userId, currentLocked) => {
    const success = await toggleLock(userId, currentLocked);
    if (success) loadUsers(filters);
  };

  const handleChangeRole = async (userId, currentRole) => {
    const success = await changeRole(userId, currentRole);
    if (success) loadUsers(filters);
  };

  const handleDelete = async (userId) => {
    const success = await deleteUser(userId);
    if (success) loadUsers(filters);
  };

  const handleRestore = async (userId) => {
    const success = await restoreUser(userId);
    if (success) loadUsers(filters);
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
          onPaginationChange={setPagination}
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
          onSuccess={() => loadUsers(filters)}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => loadUsers(filters)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
