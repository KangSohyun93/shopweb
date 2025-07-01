const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { recipient_name, phone, street, city, country, is_default } = req.body;
        const user_id = req.user.user_id;

        if (!recipient_name || !phone || !street || !city || !country) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (is_default) {
            await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [user_id]);
        }

        const [result] = await pool.query(
            `INSERT INTO addresses (user_id, recipient_name, phone, street, city, country, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, recipient_name, phone, street, city, country, is_default || 0]
        );

        const [newAddress] = await pool.query('SELECT * FROM addresses WHERE address_id = ?', [result.insertId]);
        res.status(201).json(newAddress[0]);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ error: 'Failed to create address' });
    }
});

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [addresses] = await pool.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, address_id DESC',
            [user_id]
        );

        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

module.exports = router;
