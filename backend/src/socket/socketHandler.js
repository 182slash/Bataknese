const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Store connected users
const connectedUsers = new Map();

const socketHandler = (io) => {
  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const result = await pool.query(
        'SELECT id, full_name, email, marga, avatar FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = result.rows[0];
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.user.full_name} (${socket.user.id})`);
    
    // Store connected user
    connectedUsers.set(socket.user.id, {
      socketId: socket.id,
      user: socket.user
    });

    // Emit online status to all users
    io.emit('user:online', {
      userId: socket.user.id,
      full_name: socket.user.full_name
    });

    // Join user's personal room (for direct messages)
    socket.join(`user:${socket.user.id}`);

    // ==================== ROOM MANAGEMENT ====================
    
    // Join a chat room
    socket.on('room:join', async (data) => {
      try {
        const { roomId } = data;

        // Verify user has access to this room
        const roomCheck = await pool.query(
          `SELECT * FROM chat_rooms 
           WHERE id = $1 
           AND (
             (room_type = 'direct' AND (participant_1 = $2 OR participant_2 = $2))
             OR (room_type = 'community' AND EXISTS (
               SELECT 1 FROM community_members 
               WHERE community_id = chat_rooms.community_id 
               AND user_id = $2
             ))
           )`,
          [roomId, socket.user.id]
        );

        if (roomCheck.rows.length === 0) {
          socket.emit('error', { message: 'Access denied to this room' });
          return;
        }

        // Join the room
        socket.join(`room:${roomId}`);
        
        // Notify room
        socket.to(`room:${roomId}`).emit('room:user_joined', {
          userId: socket.user.id,
          full_name: socket.user.full_name,
          roomId
        });

        socket.emit('room:joined', { roomId });
        
        console.log(`User ${socket.user.full_name} joined room ${roomId}`);
      } catch (error) {
        console.error('Room join error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a chat room
    socket.on('room:leave', (data) => {
      const { roomId } = data;
      socket.leave(`room:${roomId}`);
      
      socket.to(`room:${roomId}`).emit('room:user_left', {
        userId: socket.user.id,
        full_name: socket.user.full_name,
        roomId
      });

      console.log(`User ${socket.user.full_name} left room ${roomId}`);
    });

    // ==================== MESSAGING ====================

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { roomId, content, messageType = 'text' } = data;

        // Verify room access
        const roomCheck = await pool.query(
          `SELECT * FROM chat_rooms 
           WHERE id = $1 
           AND (
             (room_type = 'direct' AND (participant_1 = $2 OR participant_2 = $2))
             OR (room_type = 'community' AND EXISTS (
               SELECT 1 FROM community_members 
               WHERE community_id = chat_rooms.community_id 
               AND user_id = $2
             ))
           )`,
          [roomId, socket.user.id]
        );

        if (roomCheck.rows.length === 0) {
          socket.emit('error', { message: 'Access denied to this room' });
          return;
        }

        // Save message to database
        const result = await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, message_type, content)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [roomId, socket.user.id, messageType, content]
        );

        const message = result.rows[0];

        // Prepare message object
        const messageData = {
          ...message,
          sender_name: socket.user.full_name,
          sender_marga: socket.user.marga,
          sender_avatar: socket.user.avatar
        };

        // Emit to room
        io.to(`room:${roomId}`).emit('message:received', messageData);

        // If direct message, emit to both participants
        if (roomCheck.rows[0].room_type === 'direct') {
          const otherUserId = roomCheck.rows[0].participant_1 === socket.user.id
            ? roomCheck.rows[0].participant_2
            : roomCheck.rows[0].participant_1;

          io.to(`user:${otherUserId}`).emit('message:new', {
            ...messageData,
            roomId
          });
        }

        console.log(`Message sent in room ${roomId} by ${socket.user.full_name}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('typing:user', {
        userId: socket.user.id,
        full_name: socket.user.full_name,
        roomId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('typing:user', {
        userId: socket.user.id,
        full_name: socket.user.full_name,
        roomId,
        isTyping: false
      });
    });

    // Mark messages as read
    socket.on('message:mark_read', async (data) => {
      try {
        const { roomId } = data;

        await pool.query(
          `UPDATE chat_messages 
           SET is_read = true 
           WHERE room_id = $1 
           AND sender_id != $2 
           AND is_read = false`,
          [roomId, socket.user.id]
        );

        socket.emit('message:marked_read', { roomId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // ==================== COMMUNITY EVENTS ====================

    // Join community chat
    socket.on('community:join_chat', async (data) => {
      try {
        const { communityId } = data;

        // Verify membership
        const memberCheck = await pool.query(
          `SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2`,
          [communityId, socket.user.id]
        );

        if (memberCheck.rows.length === 0) {
          socket.emit('error', { message: 'You must be a member to join community chat' });
          return;
        }

        // Get community chat room
        const roomResult = await pool.query(
          `SELECT id FROM chat_rooms WHERE room_type = 'community' AND community_id = $1`,
          [communityId]
        );

        if (roomResult.rows.length > 0) {
          const roomId = roomResult.rows[0].id;
          socket.join(`room:${roomId}`);
          
          socket.to(`room:${roomId}`).emit('community:user_joined', {
            userId: socket.user.id,
            full_name: socket.user.full_name,
            communityId
          });

          socket.emit('community:chat_joined', { communityId, roomId });
        }
      } catch (error) {
        console.error('Community join error:', error);
        socket.emit('error', { message: 'Failed to join community chat' });
      }
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', () => {
      console.log(`✗ User disconnected: ${socket.user.full_name}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user.id);
      
      // Emit offline status
      io.emit('user:offline', {
        userId: socket.user.id,
        full_name: socket.user.full_name
      });
    });

    // ==================== ERROR HANDLING ====================

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to get online users
  io.getOnlineUsers = () => {
    return Array.from(connectedUsers.values()).map(u => ({
      userId: u.user.id,
      full_name: u.user.full_name
    }));
  };
};

module.exports = socketHandler;
