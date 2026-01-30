const Review = require('../models/review');

const reviewController = {
    createReview: async (req, res) => {
        try {
            const { product_id, rating, comment, order_id } = req.body;
            const user_id = req.user.user_id; // Lấy từ JWT

            if (!product_id || !rating || rating < 1 || rating > 5 || !order_id) {
                return res.status(400).json({ error: 'Missing or invalid fields' });
            }

            // Kiểm tra đơn hàng đã delivered và trong vòng 15 ngày
            const orderCheck = await Review.checkOrderEligibleForReview(order_id, user_id);
            if (!orderCheck.eligible) {
                return res.status(403).json({ error: orderCheck.reason });
            }

            // Kiểm tra xem đã review cho sản phẩm trong đơn hàng này chưa
            const existingReview = await Review.getByUserAndProduct(user_id, product_id, order_id);
            if (existingReview) {
                return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi' });
            }

            const reviewId = await Review.create({ product_id, user_id, rating, comment, order_id });
            res.status(201).json({ id: reviewId, message: 'Review created successfully' });
        } catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({ error: 'Failed to create review' });
        }
    },

    getReviews: async (req, res) => {
        try {
            const product_id = req.query.product_id;
            const reviews = await Review.getAll(product_id);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    },

    getReviewById: async (req, res) => {
        try {
            const review = await Review.getById(req.params.id);
            if (!review) {
                return res.status(404).json({ error: 'Review not found' });
            }
            res.json(review);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch review' });
        }
    },

    updateReview: async (req, res) => {
        try {
            const { rating, comment } = req.body;
            const user_id = req.user.user_id; // Lấy từ JWT

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Invalid rating' });
            }

            // Kiểm tra edit_count trước khi cập nhật
            const existingReview = await Review.getById(req.params.id);
            if (!existingReview) {
                return res.status(404).json({ error: 'Review not found' });
            }
            if (existingReview.user_id !== user_id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            if (existingReview.edit_count >= 1) {
                return res.status(400).json({ error: 'Bạn chỉ có thể sửa đánh giá 1 lần' });
            }

            // Kiểm tra 15 ngày cho update
            const orderCheck = await Review.checkOrderEligibleForReview(existingReview.order_id, user_id);
            if (!orderCheck.eligible) {
                return res.status(403).json({ error: orderCheck.reason });
            }

            const success = await Review.update(req.params.id, user_id, { rating, comment });
            if (!success) {
                return res.status(404).json({ error: 'Failed to update review' });
            }
            res.json({ message: 'Review updated successfully' });
        } catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({ error: 'Failed to update review' });
        }
    },

    deleteReview: async (req, res) => {
        try {
            const user_id = req.user.user_id; // Lấy từ JWT
            const success = await Review.delete(req.params.id, user_id);
            if (!success) {
                return res.status(404).json({ error: 'Review not found or unauthorized' });
            }
            res.json({ message: 'Review deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete review' });
        }
    },

    // Lấy review của user cho sản phẩm trong đơn hàng
    getReviewByUserAndProduct: async (req, res) => {
        try {
            const { product_id, order_id } = req.query;
            const user_id = req.user.user_id;

            if (!product_id || !order_id) {
                return res.status(400).json({ error: 'Missing product_id or order_id' });
            }

            const review = await Review.getByUserAndProduct(user_id, product_id, order_id);
            res.json(review || null);
        } catch (error) {
            console.error('Error fetching user review:', error);
            res.status(500).json({ error: 'Failed to fetch review' });
        }
    }
};

module.exports = reviewController;