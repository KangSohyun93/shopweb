const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const productVariantRoutes = require('./routes/productVariantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});
// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin/users', adminUserRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShopWeb API' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ message: 'Database connected', result: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});
app.use((req, res, next) => {
  console.log('No route matched:', req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO for real-time chat
const userSockets = new Map(); // userId -> socketId
const adminSockets = new Map(); // adminId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their user ID
  socket.on('user:join', (userId) => {
    if (!userId) {
      console.error('user:join received without userId');
      return;
    }
    userSockets.set(userId.toString(), socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Admin joins
  socket.on('admin:join', (adminId) => {
    if (!adminId) {
      console.error('admin:join received without adminId');
      return;
    }
    adminSockets.set(adminId.toString(), socket.id);
    socket.adminId = adminId;
    socket.isAdmin = true;
    console.log(`Admin ${adminId} joined with socket ${socket.id}`);
    
    // Notify all admins about new connection
    socket.broadcast.to('admins').emit('admin:online', adminId);
  });

  // Join admin room
  socket.on('admin:join-room', () => {
    socket.join('admins');
  });

  // Send message
  socket.on('chat:send-message', async (data) => {
    console.log('📨 Received chat:send-message event:', data);
    const { conversationId, message, senderType, senderId } = data;
    
    try {
      // Save message to database
      const Chat = require('./models/chat');
      console.log('💾 Saving message to database...');
      const newMessage = await Chat.sendMessage(conversationId, senderType, senderId, message);
      console.log('✅ Message saved with ID:', newMessage);
      
      // Get conversation details to find recipient
      const conversation = await Chat.getConversationById(conversationId);
      
      // Emit to sender
      socket.emit('chat:message-sent', newMessage);
      
      // Emit to recipient
      if (senderType === 'user') {
        // Notify all admins
        io.to('admins').emit('chat:new-message', {
          ...newMessage,
          conversationId,
          userId: conversation.user_id
        });
      } else {
        // Notify specific user
        const userSocketId = userSockets.get(conversation.user_id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit('chat:new-message', {
            ...newMessage,
            conversationId
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('chat:mark-read', async (conversationId) => {
    try {
      const Chat = require('./models/chat');
      const senderType = socket.isAdmin ? 'user' : 'admin';
      await Chat.markAsRead(conversationId, senderType);
      
      // Notify the other party
      if (socket.isAdmin) {
        const conversation = await Chat.getConversationById(conversationId);
        const userSocketId = userSockets.get(conversation.user_id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit('chat:messages-read', conversationId);
        }
      } else {
        io.to('admins').emit('chat:messages-read', conversationId);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    const { conversationId, isTyping } = data;
    
    if (socket.isAdmin) {
      // Notify user
      const Chat = require('./models/chat');
      Chat.getConversationById(conversationId).then(conversation => {
        const userSocketId = userSockets.get(conversation.user_id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit('chat:typing', { conversationId, isTyping, isAdmin: true });
        }
      });
    } else {
      // Notify admins
      io.to('admins').emit('chat:typing', { conversationId, isTyping, userId: socket.userId });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      userSockets.delete(socket.userId.toString());
    }
    
    if (socket.adminId) {
      adminSockets.delete(socket.adminId.toString());
      // Notify other admins
      socket.broadcast.to('admins').emit('admin:offline', socket.adminId);
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Socket.IO server ready`);
});