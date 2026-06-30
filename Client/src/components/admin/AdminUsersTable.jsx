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
  const UserActions = ({ user }) => (
    <div className="flex gap-2 flex-wrap">
      {user.is_deleted ? (
        <button
          onClick={() => onRestore(user.user_id)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Khôi phục
        </button>
      ) : (
        <>
          <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-800 text-sm">Sửa</button>
          <button onClick={() => onToggleLock(user.user_id, user.is_locked)} className="text-yellow-600 hover:text-yellow-800 text-sm">
            {user.is_locked ? 'Mở khoá' : 'Khoá'}
          </button>
          <button onClick={() => onChangeRole(user.user_id, user.role)} className="text-purple-600 hover:text-purple-800 text-sm">Đổi role</button>
          <button onClick={() => onDelete(user.user_id)} className="text-red-600 hover:text-red-800 text-sm">Xoá</button>
        </>
      )}
    </div>
  );

  const StatusBadge = ({ user }) => {
    if (user.is_deleted) return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Đã xoá</span>;
    if (user.is_locked) return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Đã khoá</span>;
    return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Hoạt động</span>;
  };

  const RoleBadge = ({ role }) => (
    <span className={`px-2 py-1 rounded text-xs ${
      role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {role}
    </span>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">Đang tải...</div>
      ) : (
        <>
          {/* ── Mobile Card Layout ── */}
          <div className="md:hidden space-y-3 p-3">
            {users.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Không có người dùng nào</div>
            ) : (
              users.map(user => (
                <div key={user.user_id} className={`rounded-xl border shadow-sm p-4 ${user.is_deleted ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{user.username}</span>
                        <RoleBadge role={user.role} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {(user.first_name || user.last_name) && (
                        <p className="text-xs text-gray-400 mt-0.5">{user.first_name} {user.last_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge user={user} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-mono">ID: {user.user_id}</span>
                    <UserActions user={user} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Desktop Table Layout ── */}
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.user_id} className={user.is_deleted ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">{user.user_id}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.first_name} {user.last_name}</td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3"><StatusBadge user={user} /></td>
                    <td className="px-4 py-3"><UserActions user={user} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ✅ Pagination */}
          {pagination.total > 0 && (
            <div className="px-3 sm:px-4 py-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                Hiển thị {users.length} / Tổng: <strong>{pagination.total}</strong> người dùng
                &nbsp;|&nbsp; Trang {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                <button
                  onClick={() => onPaginationChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2 sm:px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1">...</span>}
                      <button
                        onClick={() => onPaginationChange(p)}
                        className={`px-2 sm:px-3 py-1 border rounded text-sm ${pagination.page === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))
                }
                <button
                  onClick={() => onPaginationChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-2 sm:px-3 py-1 border rounded text-sm disabled:opacity-50"
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