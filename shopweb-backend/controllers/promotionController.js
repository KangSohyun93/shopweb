const Promotion = require('../models/promotion');

const promotionController = {
    // Tạo khuyến mãi mới
    createPromotion: async (req, res) => {
        try {
            const { code, description, discount_type, discount_value, start_date, end_date, min_order_value } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!code || !discount_type || !discount_value || !start_date || !end_date) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (!['percentage', 'fixed'].includes(discount_type)) {
                return res.status(400).json({ error: 'Invalid discount type' });
            }

            const promotionId = await Promotion.create({
                code,
                description,
                discount_type,
                discount_value,
                start_date,
                end_date,
                min_order_value
            });

            res.status(201).json({ id: promotionId, message: 'Promotion created successfully' });
        } catch (error) {
            console.error('Error creating promotion:', error);
            res.status(500).json({ error: 'Failed to create promotion' });
        }
    },

    // Lấy danh sách khuyến mãi
    getPromotions: async (req, res) => {
        try {
            const promotions = await Promotion.getAll();
            res.json(promotions);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            res.status(500).json({ error: 'Failed to fetch promotions' });
        }
    },

    // Lấy chi tiết khuyến mãi
    getPromotionById: async (req, res) => {
        try {
            const promotion = await Promotion.getById(req.params.id);
            if (!promotion) {
                return res.status(404).json({ error: 'Promotion not found' });
            }
            res.json(promotion);
        } catch (error) {
            console.error('Error fetching promotion:', error);
            res.status(500).json({ error: 'Failed to fetch promotion' });
        }
    },

    // Sửa khuyến mãi
    updatePromotion: async (req, res) => {
        try {
            const { promotion_id } = req.params;
            const { code, description, discount_type, discount_value, start_date, end_date, min_order_value } = req.body;
            if (!code || !discount_type || !discount_value || !start_date || !end_date) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            if (!['percentage', 'fixed'].includes(discount_type)) {
                return res.status(400).json({ error: 'Invalid discount type' });
            }
            await Promotion.update(promotion_id, {
                code,
                description,
                discount_type,
                discount_value,
                start_date,
                end_date,
                min_order_value
            });
            res.json({ message: 'Promotion updated successfully' });
        } catch (error) {
            console.error('Error updating promotion:', error);
            res.status(500).json({ error: 'Failed to update promotion' });
        }
    },

    // Xóa khuyến mãi
    deletePromotion: async (req, res) => {
        try {
            const { promotion_id } = req.params;
            await Promotion.delete(promotion_id);
            res.json({ message: 'Promotion deleted successfully' });
        } catch (error) {
            console.error('Error deleting promotion:', error);
            res.status(500).json({ error: 'Failed to delete promotion' });
        }
    },

    // Áp dụng khuyến mãi
    applyPromotion: async (req, res) => {
        try {
            const { code, total_amount } = req.body;
            const parsedTotal = parseFloat(total_amount);
            if (!code || isNaN(parsedTotal) || parsedTotal <= 0) {
                return res.status(400).json({ error: 'Missing or invalid fields' });
            }
            const result = await Promotion.applyPromotion(code, parsedTotal);
            res.status(200).json({
                message: 'Promotion applied successfully',
                new_total: result.new_total,
                promotion_id: result.promotion_id
            });
        } catch (error) {
            console.error('Promotion error:', error.message);
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = promotionController;