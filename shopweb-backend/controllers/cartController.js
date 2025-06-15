const Cart = require('../models/cart');

const cartController = {
    addToCart: async (req, res) => {
        try {
            const { variant_id, quantity } = req.body;
            const user_id = req.user.user_id;

            if (!variant_id || !quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Missing or invalid fields' });
            }

            const cartItemId = await Cart.addItem(user_id, variant_id, quantity);
            res.status(201).json({ id: cartItemId, message: 'Item added to cart' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add item to cart' });
        }
    },

    getCart: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const cart = await Cart.getCart(user_id);
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch cart' });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const { cart_item_id } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid quantity' });
            }

            const success = await Cart.updateItem(cart_item_id, quantity);
            if (!success) {
                return res.status(404).json({ error: 'Cart item not found' });
            }

            res.json({ message: 'Cart item updated' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update cart item' });
        }
    },

    updateCartItemVariant: async (req, res) => {
        try {
            const { cart_item_id } = req.params;
            const { variant_id } = req.body;

            if (!variant_id) {
                return res.status(400).json({ error: 'Invalid variant_id' });
            }

            const success = await Cart.updateVariant(cart_item_id, variant_id);
            if (!success) {
                return res.status(404).json({ error: 'Cart item not found' });
            }

            res.json({ message: 'Cart item variant updated' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update cart item variant' });
        }
    },

    deleteCartItem: async (req, res) => {
        try {
            const { cart_item_id } = req.params;

            const success = await Cart.deleteItem(cart_item_id);
            if (!success) {
                return res.status(404).json({ error: 'Cart item not found' });
            }

            res.json({ message: 'Cart item deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete cart item' });
        }
    }
};

module.exports = cartController;