import { useState, useEffect } from 'react';

const useOrderFiltering = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    return_requested: 0,
    returning: 0,
    refunded: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/orders/admin/all?page=${currentPage}&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        setAllOrders(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
        
        // Fetch all orders to count status
        const allResponse = await fetch('http://localhost:5000/api/orders/admin/all?page=1&limit=999999', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const allData = await allResponse.json();
        const allOrdersList = Array.isArray(allData.data) ? allData.data : [];
        
        const counts = {
          all: allOrdersList.length,
          pending: allOrdersList.filter(o => o.status === 'pending').length,
          processing: allOrdersList.filter(o => o.status === 'processing').length,
          shipped: allOrdersList.filter(o => o.status === 'shipped').length,
          delivered: allOrdersList.filter(o => o.status === 'delivered').length,
          cancelled: allOrdersList.filter(o => o.status === 'cancelled').length,
          return_requested: allOrdersList.filter(o => o.status === 'return_requested').length,
          returning: allOrdersList.filter(o => o.status === 'returning').length,
          refunded: allOrdersList.filter(o => o.status === 'refunded').length
        };
        setStatusCounts(counts);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(allOrders.filter(order => order.status === activeTab));
    }
  }, [activeTab, allOrders]);

  const getCount = (status) => {
    return statusCounts[status] || 0;
  };

  return {
    filteredOrders,
    loading,
    error,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    statusCounts,
    getCount,
    setAllOrders
  };
};

export default useOrderFiltering;
