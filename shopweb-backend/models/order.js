const pool = require('../config/db');
const Promotion = require('./promotion');

const Order = {
    create: async (order) => {
    const { user_id, address_id, total_amount, items, promotion_code } = order;
    let final_amount = total_amount;
    let promotion_id = null;

    if (!user_id || !address_id || !total_amount || !items || !items.length) {
        throw new Error('Missing required order fields');
    }

        const [user] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [user_id]);
        if (!user.length) {
            throw new Error(`User_id ${user_id} not found`);
        }

        const [address] = await pool.query(
            `SELECT address_id FROM addresses WHERE address_id = ? AND user_id = ?`,
            [address_id, user_id]
        );
        if (!address.length) {
            throw new Error(`Invalid address_id ${address_id} for user_id ${user_id}`);
        }

         if (promotion_code) {
        try {
            const promotionResult = await Promotion.apply(promotion_code, total_amount);
            final_amount = promotionResult.new_total;
            promotion_id = promotionResult.promotion_id;
        } catch (error) {
            throw error;
        }
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, address_id, total_amount, promotion_id, status) VALUES (?, ?, ?, ?, 'pending')`,
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
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
},

    getByUserId: async (user_id) => {
    // Lấy danh sách các đơn hàng tóm tắt của người dùng
    const [orders] = await pool.query(
        `SELECT o.*, a.recipient_name, a.phone
         FROM orders o
         LEFT JOIN addresses a ON o.address_id = a.address_id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [user_id]
    );

    if (orders.length === 0) {
        return [];
    }

    // Dùng một vòng lặp để lấy chi tiết sản phẩm cho TỪNG đơn hàng
    const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
            const [items] = await pool.query(
                `SELECT oi.*, p.name as product_name,p.product_id, p.primary_image_url, pv.image_url, pv.size
                 FROM order_items oi
                 JOIN product_variants pv ON oi.variant_id = pv.variant_id
                 JOIN products p ON pv.product_id = p.product_id
                 WHERE oi.order_id = ?`,
                [order.order_id]
            );
            return { ...order, items };
        })
    );

    return ordersWithItems;
},


   getById: async (order_id, userId, userRole = 'customer') => {
    let query = `
        SELECT o.*, a.recipient_name, a.phone, a.street, a.city, a.country, p.code as promotion_code, u.username
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN addresses a ON o.address_id = a.address_id
        LEFT JOIN promotions p ON o.promotion_id = p.promotion_id
        WHERE o.order_id = ?`;
    
    const params = [order_id];

    if (userRole !== 'admin') {
        query += ` AND o.user_id = ?`;
        params.push(userId);
    }

    const [orderRows] = await pool.query(query, params);

    if (orderRows.length === 0) return null;

    const [itemRows] = await pool.query(
        `SELECT 
            oi.*, 
            pv.image_url, 
            pv.size, 
            p.product_id,          -- Thêm product_id để link
            p.name as product_name, 
            p.primary_image_url    -- Thêm ảnh chính của sản phẩm
         FROM order_items oi
         LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
         LEFT JOIN products p ON pv.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [order_id]
    );

    return { ...orderRows[0], items: itemRows };
},
    

    // lấy tất cả đơn hàng
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
        const validStatuses = ['pending','processing' ,'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const [result] = await pool.query(
            `UPDATE orders SET status = ? WHERE order_id = ?`,
            [status, order_id]
        );
        return result.affectedRows > 0;
    },
    cancel: async (order_id, user_id, userRole = 'customer') => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            let findOrderQuery = `SELECT status FROM orders WHERE order_id = ?`;
            const params = [order_id];
            
            if (userRole !== 'admin') {
                findOrderQuery += ` AND user_id = ?`;
                params.push(user_id);
            }

            const [orderRows] = await connection.query(findOrderQuery, params);

            if (orderRows.length === 0) {
                throw new Error('Order not found or you do not have permission to cancel it.');
            }

            const order = orderRows[0];
            if (!['pending', 'processing'].includes(order.status)) {
                throw new Error(`Cannot cancel order with status: ${order.status}`);
            }

            const [items] = await connection.query(
                `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
                [order_id]
            );

            for (const item of items) {
                await connection.query(
                    `UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?`,
                    [item.quantity, item.variant_id]
                );
            }

            await connection.query(
                `UPDATE orders SET status = 'cancelled' WHERE order_id = ?`,
                [order_id]
            );
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Failed to cancel order:', error);
            throw error; 
        } finally {
            connection.release();
        }
    }
};

module.exports = Order;