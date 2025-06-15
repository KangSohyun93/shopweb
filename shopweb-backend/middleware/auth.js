const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid authorization header:', req.headers.authorization);
        return res.status(401).json({ error: 'Access token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Verifying token for path:', req.path, 'Token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token successfully for path:', req.path, decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error for path:', req.path, error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token has expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin role for path:', req.path, 'User:', req.user);
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authenticateJWT, isAdmin };