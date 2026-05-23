const UserFilters = ({ filters, onFilterChange, onCreateClick }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="border rounded px-3 py-2"
          value={filters.q}
          onChange={(e) => onFilterChange('q', e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={filters.role}
          onChange={(e) => onFilterChange('role', e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.is_locked}
          onChange={(e) => onFilterChange('is_locked', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="false">Hoạt động</option>
          <option value="true">Đã khoá</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.is_deleted}
          onChange={(e) => onFilterChange('is_deleted', e.target.value)}
        >
          <option value="false">Chưa xoá</option>
          <option value="true">Đã xoá</option>
        </select>
      </div>
      <div className="mt-4">
        <button
          onClick={onCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tạo người dùng mới
        </button>
      </div>
    </div>
  );
};

export default UserFilters;
