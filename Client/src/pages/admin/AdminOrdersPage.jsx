import { useEffect } from 'react';
import OrderStatusTabs from '../../components/admin/OrderStatusTabs';
import OrdersTable from '../../components/admin/OrdersTable';
import useOrderFiltering from '../../hooks/useOrderFiltering';

const AdminOrdersPage = () => {
  const {
    filteredOrders,
    loading,
    error,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    statusCounts,
    setAllOrders,
    allOrders
  } = useOrderFiltering();

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang chuẩn bị' },
    { key: 'shipped', label: 'Đang giao' },
    { key: 'delivered', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'return_requested', label: '🔄 Yêu cầu trả hàng' },
    { key: 'returning', label: '📦 Đang hoàn hàng' },
    { key: 'refunded', label: 'Đã hoàn tiền' },
  ];

  const handleOrderUpdate = (updatedOrder) => {
    setAllOrders(prevOrders => 
      prevOrders.map(order => 
        order.order_id === updatedOrder.order_id ? updatedOrder : order
      )
    );
  };

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu đơn hàng...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Quản lý Đơn hàng</h2>

      <OrderStatusTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        statusCounts={statusCounts}
      />

      <OrdersTable 
        filteredOrders={filteredOrders}
        onOrderUpdate={handleOrderUpdate}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
};

export default AdminOrdersPage;