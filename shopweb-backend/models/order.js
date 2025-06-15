const pool = require('../config/db');
const Promotion = require('./promotion');

const Order = {
    create: async (order) => {
        const { user_id, address_id, total_amount, items, promotion_code } = order;
        let final_amount = total_amount;
        let promotion_id = null;

        // Validate inputs
        if (!user_id || !address_id || !total_amount || !items || !items.length) {
            throw new Error('Missing required order fields');
        }

        // Validate user_id
        const [user] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [user_id]);
        if (!user.length) {
            throw new Error(`User_id ${user_id} not found`);
        }

        // Validate address_id
        const [address] = await pool.query(
            `SELECT address_id FROM addresses WHERE address_id = ? AND user_id = ?`,
            [address_id, user_id]
        );
        if (!address.length) {
            throw new Error(`Invalid address_id ${address_id} for user_id ${user_id}`);
        }

        // Validate promotion
        if (promotion_code) {
            try {
                console.log('Applying promotion:', { promotion_code, total_amount });
                const promotionResult = await Promotion.applyPromotion(promotion_code, total_amount);
                final_amount = promotionResult.new_total;
                promotion_id = promotionResult.promotion_id;
            } catch (error) {
                console.error('Promotion error:', error.message, error.stack);
                throw error;
            }
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            console.log('Inserting order with:', { user_id, address_id, final_amount, promotion_id });

            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, address_id, total_amount, promotion_id, status)
                 VALUES (?, ?, ?, ?, 'pending')`,
                [user_id, address_id, final_amount, promotion_id]
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                const { variant_id, quantity, price } = item;
                if (!variant_id || !quantity || !price || quantity <= 0) {
                    throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
                }

                console.log('Processing item:', { variant_id, quantity, price });

                const [variant] = await connection.query(
                    `SELECT stock_quantity, price FROM product_variants WHERE variant_id = ?`,
                    [variant_id]
                );
                if (!variant.length) {
                    throw new Error(`Variant_id ${variant_id} not found`);
                }
                if (variant[0].stock_quantity < quantity) {
                    throw new Error(`Insufficient stock for variant_id ${variant_id}: available ${variant[0].stock_quantity}, requested ${quantity}`);
                }
                // So sánh price linh hoạt
                const dbPrice = Number(variant[0].price);
                const inputPrice = Number(price);
                if (dbPrice !== inputPrice) {
                    throw new Error(`Price mismatch for variant_id ${variant_id}: database ${dbPrice}, provided ${inputPrice}`);
                }

                await connection.query(
                    `INSERT INTO order_items (order_id, variant_id, quantity, price)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, variant_id, quantity, price]
                );

                await connection.query(
                    `UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?`,
                    [quantity, variant_id]
                );
            }

            // Xóa giỏ hàng
            const [cart] = await connection.query(
                `SELECT cart_id FROM cart WHERE user_id = ?`,
                [user_id]
            );
            if (cart.length) {
                console.log('Clearing cart for cart_id:', cart[0].cart_id);
                await connection.query(
                    `DELETE FROM cart_items WHERE cart_id = ?`,
                    [cart[0].cart_id]
                );
                await connection.query(
                    `UPDATE cart SET total_amount = 0 WHERE cart_id = ?`,
                    [cart[0].cart_id]
                );
            } else {
                console.warn(`No cart found for user_id ${user_id}`);
            }

            await connection.commit();
            console.log('Order created successfully:', { orderId });
            return orderId;
        } catch (error) {
            console.error('Transaction error:', error.message, error.stack);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getByUserId: async (user_id) => {
        const [rows] = await pool.query(
            `SELECT o.*, a.recipient_name, a.street, a.city, a.country, p.code as promotion_code
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.address_id
             LEFT JOIN promotions p ON o.promotion_id = p.promotion_id
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC`,
            [user_id]
        );
        return rows;
    },

    getById: async (order_id, user_id) => {
        const [orderRows] = await pool.query(
            `SELECT o.*, a.recipient_name, a.street, a.city, a.country, p.code as promotion_code
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.address_id
             LEFT JOIN promotions p ON o.promotion_id = p.promotion_id
             WHERE o.order_id = ? AND o.user_id = ?`,
            [order_id, user_id]
        );

        if (orderRows.length === 0) return null;

        const [itemRows] = await pool.query(
            `SELECT oi.*, pv.sku, p.name as product_name
             FROM order_items oi
             LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
             LEFT JOIN products p ON pv.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [order_id]
        );

        return { ...orderRows[0], items: itemRows };
    },

    // Sửa lại getAll để lấy tất cả đơn hàng
    getAll: async () => {
    const [rows] = await pool.query(
        `SELECT o.*, u.email as user_email, a.recipient_name, a.street, a.city, a.country, p.code as promotion_code
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.user_id
         LEFT JOIN addresses a ON o.address_id = a.address_id
         LEFT JOIN promotions p ON o.promotion_id = p.promotion_id
         ORDER BY o.created_at DESC`
    );
    return rows;
},

    updateStatus: async (order_id, status) => {
        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const [result] = await pool.query(
            `UPDATE orders SET status = ? WHERE order_id = ?`,
            [status, order_id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Order;