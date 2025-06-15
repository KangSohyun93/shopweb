const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { recipient_name, phone, street, city, country } = req.body;
        const user_id = req.user.user_id;

        if (!recipient_name || !phone || !street || !city || !country) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await pool.query(
            `INSERT INTO addresses (user_id, recipient_name, phone, street, city, country)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, recipient_name, phone, street, city, country]
        );

        res.status(201).json({ id: result.insertId, message: 'Address created successfully' });
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ error: 'Failed to create address' });
    }
});

module.exports = router;