const ProductVariant = require('../models/productVariant');

const productVariantController = {
    // Lấy tất cả biến thể
    getVariants: async (req, res) => {
        try {
            const product_id = req.query.product_id;
            const variants = await ProductVariant.getAll(product_id);
            res.json(variants);
        } catch (error) {
            console.error('Error fetching variants:', error);
            res.status(500).json({ error: 'Failed to fetch variants' });
        }
    },

    // Lấy biến thể theo ID
    getVariantById: async (req, res) => {
        try {
            const variant = await ProductVariant.getById(req.params.id);
            if (!variant) {
                return res.status(404).json({ error: 'Variant not found' });
            }
            res.json(variant);
        } catch (error) {
            console.error('Error fetching variant:', error);
            res.status(500).json({ error: 'Failed to fetch variant' });
        }
    },

    // Tạo biến thể mới (yêu cầu admin)
    createVariant: async (req, res) => {
        try {
            const { product_id, sku, price, stock_quantity, weight, image_url, attributes } = req.body;

            if (!product_id || !sku || !price || !stock_quantity) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const variantId = await ProductVariant.create({
                product_id,
                sku,
                price,
                stock_quantity,
                weight,
                image_url,
                attributes
            });
            res.status(201).json({ id: variantId, message: 'Variant created successfully' });
        } catch (error) {
            console.error('Error creating variant:', error);
            res.status(500).json({ error: 'Failed to create variant' });
        }
    },

    // Cập nhật biến thể (yêu cầu admin)
    updateVariant: async (req, res) => {
        try {
            const { sku, price, stock_quantity, weight, image_url, attributes } = req.body;

            const success = await ProductVariant.update(req.params.id, {
                sku,
                price,
                stock_quantity,
                weight,
                image_url,
                attributes
            });
            if (!success) {
                return res.status(404).json({ error: 'Variant not found' });
            }
            res.json({ message: 'Variant updated successfully' });
        } catch (error) {
            console.error('Error updating variant:', error);
            res.status(500).json({ error: 'Failed to update variant' });
        }
    },

    // Xóa biến thể (yêu cầu admin)
    deleteVariant: async (req, res) => {
        try {
            const success = await ProductVariant.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Variant not found' });
            }
            res.json({ message: 'Variant deleted successfully' });
        } catch (error) {
            console.error('Error deleting variant:', error);
            res.status(500).json({ error: 'Failed to delete variant' });
        }
    }
};

module.exports = productVariantController;