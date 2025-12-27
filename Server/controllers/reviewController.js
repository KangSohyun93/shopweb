const Review = require('../models/review');

const reviewController = {
    createReview: async (req, res) => {
        try {
            const { product_id, rating, comment } = req.body;
            const user_id = req.user.user_id; // Lấy từ JWT

            if (!product_id || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Missing or invalid fields' });
            }

            const reviewId = await Review.create({ product_id, user_id, rating, comment });
            res.status(201).json({ id: reviewId, message: 'Review created successfully' });
        } catch (error) {
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

            const success = await Review.update(req.params.id, user_id, { rating, comment });
            if (!success) {
                return res.status(404).json({ error: 'Review not found or unauthorized' });
            }
            res.json({ message: 'Review updated successfully' });
        } catch (error) {
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
    }
};

module.exports = reviewController;