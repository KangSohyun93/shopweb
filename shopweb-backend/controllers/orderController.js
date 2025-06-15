const Order = require('../models/order');

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { address_id, total_amount, items, promotion_code } = req.body;
      const user_id = req.user.user_id;

      if (!address_id || !total_amount || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const orderId = await Order.create({
        user_id,
        address_id,
        total_amount,
        items,
        promotion_code,
      });
      res.status(201).json({ id: orderId, message: 'Order created successfully' });
    } catch (error) {
      console.error('Error creating order:', error);
      if (
        error.message.includes('Invalid or expired promotion code') ||
        error.message.includes('Order amount must be at least')
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  getOrders: async (req, res) => {
    try {
      const user_id = req.user.user_id;
      const orders = await Order.getByUserId(user_id);
      console.log('Orders fetched for user:', user_id, 'Data:', orders);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.query.user_id || req.user?.user_id; // Lấy user_id từ query hoặc token
      console.log(`Fetching order by ID: ${id} for user: ${user_id}`);

      const order = await Order.getById(id, user_id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      console.log(`Fetching order by ID: ${id} for user: ${user_id}`);

      const order = await Order.getById(id, user_id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      console.log('Fetching all orders for user:', req.user);
      const orders = await Order.getAll();
      console.log('Orders fetched:', orders);
      if (!orders || orders.length === 0) {
        return res.status(200).json([]);
      }
      res.json(orders);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ error: 'Failed to fetch all orders' });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing status' });
      }
      const success = await Order.updateStatus(id, status);
      if (!success) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.message === 'Invalid status') {
        return res.status(400).json({ error: 'Invalid status' });
      }
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },
};

module.exports = orderController;