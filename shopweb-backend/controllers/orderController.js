const Order = require('../models/order');

const orderController = {
    // TẠO ĐƠN HÀNG MỚI
    createOrder: async (req, res) => {
        try {
            const orderData = { ...req.body, user_id: req.user.user_id };
            const orderId = await Order.create(orderData);
            const newOrder = await Order.getById(orderId, req.user.user_id, req.user.role);
            res.status(201).json(newOrder);
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    },

    // LẤY CÁC ĐƠN HÀNG CỦA NGƯỜI DÙNG HIỆN TẠI
    getUserOrders: async (req, res) => {
        try {
            const orders = await Order.getByUserId(req.user.user_id);
            res.json(orders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ error: 'Failed to fetch user orders' });
        }
    },

    // LẤY CHI TIẾT MỘT ĐƠN HÀNG (DÙNG CHO CẢ USER VÀ ADMIN)
    getOrderById: async (req, res) => {
        try {
            const order = await Order.getById(req.params.id, req.user.user_id, req.user.role);
            if (!order) {
                return res.status(404).json({ error: 'Order not found or access denied' });
            }
            res.json(order);
        } catch (error) {
            console.error('Error fetching order by id:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    },

    // LẤY TẤT CẢ ĐƠN HÀNG (CHỈ DÀNH CHO ADMIN)
    getAllOrdersForAdmin: async (req, res) => {
        try {
            const orders = await Order.getAll();
            res.json(orders);
        } catch (error) {
            console.error('Error fetching all orders for admin:', error);
            res.status(500).json({ error: 'Failed to fetch all orders' });
        }
    },

    // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (CHỈ DÀNH CHO ADMIN)
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const success = await Order.updateStatus(id, status);
            if (!success) {
                return res.status(404).json({ error: 'Order not found or status is invalid' });
            }
            const updatedOrder = await Order.getById(id, req.user.user_id, 'admin');
            res.json(updatedOrder);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'Failed to update order status' });
        }
    },
     cancelOrder: async (req, res) => {
        try {
            const { id: order_id } = req.params;
            const { user_id, role } = req.user;

            // Gọi hàm `cancel` từ model, truyền vào id đơn hàng, id và vai trò của người dùng
            await Order.cancel(order_id, user_id, role);
            
            // Lấy lại thông tin đơn hàng đã được cập nhật để trả về cho client
            const updatedOrder = await Order.getById(order_id, user_id, role);
            res.json(updatedOrder);

        } catch (error) {
            console.error('Error cancelling order:', error.message);
            if (error.message.includes('not found') || error.message.includes('permission')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Cannot cancel')) {
                return res.status(400).json({ error: error.message }); // 400 Bad Request
            }
            res.status(500).json({ error: 'Failed to cancel order' });
        }
    },
};

module.exports = orderController;

