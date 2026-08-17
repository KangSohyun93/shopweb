const Order = require('../models/order');
const Review = require('../models/review');

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

    // Thay thế hàm lấy tất cả đơn hàng hiện tại bằng hàm này:
    getAllOrders: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Lấy 50 đơn 1 trang cho mượt
        
        const result = await Order.getAll(page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
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

            // Kiểm tra xem đơn hàng có review nào của user này không
            const hasReviews = await Review.hasReviewsForOrder(order_id, user_id);
            if (hasReviews) {
                return res.status(400).json({ error: 'Không thể hủy đơn hàng đã được đánh giá' });
            }

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

    // Kiểm tra điều kiện return
    checkCanReturn: async (req, res) => {
        try {
            const { id: order_id } = req.params;
            const { user_id } = req.user;
            
            const result = await Order.canReturn(order_id, user_id);
            res.json(result);
        } catch (error) {
            console.error('Error checking return eligibility:', error);
            res.status(500).json({ error: 'Failed to check return eligibility' });
        }
    },

    // Request return
    requestReturn: async (req, res) => {
        try {
            const { id: order_id } = req.params;
            const { user_id } = req.user;
            const { reason } = req.body;
            
            await Order.requestReturn(order_id, user_id, reason);
            const updatedOrder = await Order.getById(order_id, user_id, req.user.role);
            
            res.json({ message: 'Return request submitted successfully', order: updatedOrder });
        } catch (error) {
            console.error('Error requesting return:', error.message);
            res.status(400).json({ error: error.message });
        }
    },
};

module.exports = orderController;

