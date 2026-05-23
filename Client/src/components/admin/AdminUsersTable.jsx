const AdminUsersTable = ({ 
  users, 
  loading, 
  pagination, 
  onPaginationChange,
  onEdit,
  onToggleLock,
  onChangeRole,
  onDelete,
  onRestore
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">Đang tải...</div>
      ) : (
        <>
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
                          onClick={() => onRestore(user.user_id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => onToggleLock(user.user_id, user.is_locked)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                          >
                            {user.is_locked ? 'Mở khoá' : 'Khoá'}
                          </button>
                          <button
                            onClick={() => onChangeRole(user.user_id, user.role)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Đổi role
                          </button>
                          <button
                            onClick={() => onDelete(user.user_id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPaginationChange({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => onPaginationChange({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsersTable;
