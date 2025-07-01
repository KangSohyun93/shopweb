const Promotion = require('../models/promotion');

const promotionController = {
    createPromotion: async (req, res) => {
        try {
            const promotionId = await Promotion.create(req.body);
            const newPromotion = await Promotion.getById(promotionId);
            res.status(201).json(newPromotion); // Trả về object đầy đủ
        } catch (error) {
            res.status(500).json({ error: 'Failed to create promotion' });
        }
    },

    getPromotions: async (req, res) => {
        try {
            const promotions = await Promotion.getAll();
            res.json(promotions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch promotions' });
        }
    },

    getPromotionById: async (req, res) => {
        try {
            const promotion = await Promotion.getById(req.params.id);
            if (!promotion) {
                return res.status(404).json({ error: 'Promotion not found' });
            }
            res.json(promotion);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch promotion' });
        }
    },

    updatePromotion: async (req, res) => {
        try {
            const { promotion_id } = req.params;
            const success = await Promotion.update(promotion_id, req.body);
            if (!success) {
                 return res.status(404).json({ error: 'Promotion not found' });
            }
            // Lấy lại thông tin đầy đủ của khuyến mãi vừa cập nhật
            const updatedPromotion = await Promotion.getById(promotion_id);
            res.json(updatedPromotion); // Trả về object đầy đủ
        } catch (error) {
            res.status(500).json({ error: 'Failed to update promotion' });
        }
    },

    deletePromotion: async (req, res) => {
        try {
            const { promotion_id } = req.params;
            await Promotion.delete(promotion_id);
            res.status(200).json({ message: 'Promotion deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete promotion' });
        }
    },

    applyPromotion: async (req, res) => {
        try {
            const { code, total_amount } = req.body;
            if (!code || total_amount === undefined) {
                return res.status(400).json({ error: 'Vui lòng cung cấp mã và tổng tiền.' });
            }
            // Gọi hàm `apply` từ model
            const result = await Promotion.apply(code, parseFloat(total_amount));
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = promotionController;
