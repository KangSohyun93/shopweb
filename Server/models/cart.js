const pool = require('../config/db');

const Cart = {
    getOrCreateCart: async (user_id) => {
        const [cartRows] = await pool.query(
            `SELECT * FROM cart WHERE user_id = ?`,
            [user_id]
        );

        if (cartRows.length > 0) {
            return cartRows[0].cart_id;
        }

        const [result] = await pool.query(
            `INSERT INTO cart (user_id) VALUES (?)`,
            [user_id]
        );
        return result.insertId;
    },

    addItem: async (user_id, variant_id, quantity) => {
        const cart_id = await Cart.getOrCreateCart(user_id);

        const [existingItem] = await pool.query(
            `SELECT * FROM cart_items WHERE cart_id = ? AND variant_id = ?`,
            [cart_id, variant_id]
        );

        if (existingItem.length > 0) {
            await pool.query(
                `UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?`,
                [quantity, existingItem[0].cart_item_id]
            );
            return existingItem[0].cart_item_id;
        } else {
            const [result] = await pool.query(
                `INSERT INTO cart_items (cart_id, variant_id, quantity)
                 VALUES (?, ?, ?)`,
                [cart_id, variant_id, quantity]
            );
            return result.insertId;
        }
    },

    getCart: async (user_id) => {
        const [cartRows] = await pool.query(
            `SELECT c.cart_id FROM cart c WHERE c.user_id = ?`,
            [user_id]
        );

        if (cartRows.length === 0) return null;

        const cart_id = cartRows[0].cart_id;
        const [items] = await pool.query(
            `SELECT ci.*, pv.sku, pv.size, pv.price, pv.image_url, pv.product_id, 
                    p.name as product_name, p.primary_image_url
             FROM cart_items ci
             LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
             LEFT JOIN products p ON pv.product_id = p.product_id
             WHERE ci.cart_id = ?`,
            [cart_id]
        );

        // Lấy tất cả biến thể của sản phẩm
        const productIds = [...new Set(items.map(item => item.product_id))]; // Lấy danh sách product_id duy nhất
        let allVariants = [];
        if (productIds.length > 0) {
            const [variants] = await pool.query(
                `SELECT pv.*, p.name as product_name
                 FROM product_variants pv
                 LEFT JOIN products p ON pv.product_id = p.product_id
                 WHERE pv.product_id IN (?)`,
                [productIds]
            );
            allVariants = variants;
        }

        // Nhóm biến thể theo product_id
        const variantMap = {};
        allVariants.forEach(v => {
            if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
            variantMap[v.product_id].push(v);
        });

        // Thêm danh sách biến thể vào mỗi item
        items.forEach(item => {
            item.variants = variantMap[item.product_id] || [];
        });

        return { cart_id, items };
    },

    updateItem: async (cart_item_id, quantity) => {
        const [result] = await pool.query(
            `UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?`,
            [quantity, cart_item_id]
        );
        return result.affectedRows > 0;
    },

    deleteItem: async (cart_item_id) => {
        const [result] = await pool.query(
            `DELETE FROM cart_items WHERE cart_item_id = ?`,
            [cart_item_id]
        );
        return result.affectedRows > 0;
    },

    // Thêm hàm để thay đổi variant_id của một item trong giỏ hàng
    updateVariant: async (cart_item_id, variant_id) => {
        const [result] = await pool.query(
            `UPDATE cart_items SET variant_id = ? WHERE cart_item_id = ?`,
            [variant_id, cart_item_id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Cart;