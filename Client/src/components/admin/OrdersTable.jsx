import { Link } from 'react-router-dom';
import StatusUpdater from './StatusUpdater';

const OrdersTable = ({ filteredOrders, onOrderUpdate, currentPage, totalPages, onPageChange, loading }) => {
  return (
    <>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Trạng thái</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Không có đơn hàng trong mục này.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username || order.user_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">{Number(order.total_amount).toLocaleString('vi-VN')} $</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusUpdater order={order} onStatusChange={onOrderUpdate} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/orders/${order.order_id}`} className="text-blue-600 hover:text-blue-900">Chi tiết</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
        <button 
          onClick={() => onPageChange(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Trang trước
        </button>
        <span className="font-bold text-gray-800 text-lg">
          Trang <span className="text-blue-600">{currentPage}</span> / <span className="text-blue-600">{totalPages}</span>
        </span>
        <button 
          onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trang sau →
        </button>
      </div>
    </>
  );
};

export default OrdersTable;
