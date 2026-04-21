const pool = require('../config/database');

// Get or create direct message room
exports.getOrCreateDMRoom = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create DM room with yourself'
      });
    }

    await client.query('BEGIN');

    // Check if room already exists (bidirectional)
    let roomResult = await client.query(
      `SELECT * FROM chat_rooms 
       WHERE room_type = 'direct' 
       AND ((participant_1 = $1 AND participant_2 = $2) 
            OR (participant_1 = $2 AND participant_2 = $1))`,
      [req.user.id, userId]
    );

    if (roomResult.rows.length === 0) {
      // Create new DM room
      roomResult = await client.query(
        `INSERT INTO chat_rooms (room_type, participant_1, participant_2)
         VALUES ('direct', $1, $2)
         RETURNING *`,
        [req.user.id, userId]
      );
    }

    await client.query('COMMIT');

    // Get other participant info
    const otherUserId = roomResult.rows[0].participant_1 === req.user.id 
      ? roomResult.rows[0].participant_2 
      : roomResult.rows[0].participant_1;

    const userResult = await pool.query(
      `SELECT id, full_name, marga, avatar FROM users WHERE id = $1`,
      [otherUserId]
    );

    res.json({
      success: true,
      data: {
        room: roomResult.rows[0],
        other_user: userResult.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Get/Create DM room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error managing DM room'
    });
  } finally {
    client.release();
  }
};

// Get my DM rooms with last message and unread count
exports.getMyDMRooms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        cr.id as room_id,
        cr.created_at,
        CASE 
          WHEN cr.participant_1 = $1 THEN cr.participant_2
          ELSE cr.participant_1
        END as other_user_id,
        u.full_name,
        u.marga,
        u.avatar,
        (SELECT content FROM chat_messages 
         WHERE room_id = cr.id 
         ORDER BY created_at DESC 
         LIMIT 1) as last_message,
        (SELECT created_at FROM chat_messages 
         WHERE room_id = cr.id 
         ORDER BY created_at DESC 
         LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM chat_messages 
         WHERE room_id = cr.id 
         AND sender_id != $1 
         AND is_read = false) as unread_count
       FROM chat_rooms cr
       JOIN users u ON (
         CASE 
           WHEN cr.participant_1 = $1 THEN cr.participant_2
           ELSE cr.participant_1
         END = u.id
       )
       WHERE cr.room_type = 'direct'
       AND (cr.participant_1 = $1 OR cr.participant_2 = $1)
       ORDER BY last_message_time DESC NULLS LAST`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get DM rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching DM rooms'
    });
  }
};

// Get messages from a room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

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
      [roomId, req.user.id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM chat_messages WHERE room_id = $1',
      [roomId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get messages
    const result = await pool.query(
      `SELECT 
        cm.*,
        u.full_name as sender_name,
        u.marga as sender_marga,
        u.avatar as sender_avatar
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.room_id = $1
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, parseInt(limit), offset]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE chat_messages 
       SET is_read = true 
       WHERE room_id = $1 
       AND sender_id != $2 
       AND is_read = false`,
      [roomId, req.user.id]
    );

    res.json({
      success: true,
      data: {
        messages: result.rows.reverse(), // Return in chronological order
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
};

// Get community chat room
exports.getCommunityChatRoom = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if user is member
    const memberCheck = await pool.query(
      `SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to access community chat'
      });
    }

    const result = await pool.query(
      `SELECT * FROM chat_rooms WHERE room_type = 'community' AND community_id = $1`,
      [communityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community chat room not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get community chat room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community chat room'
    });
  }
};

// Send message (via REST - alternative to Socket.io)
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, message_type = 'text' } = req.body;

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
      [roomId, req.user.id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/chat/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message_type, content, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [roomId, req.user.id, message_type, content, image_url]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// Get unread count for all DM rooms
exports.getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        cr.id as room_id,
        COUNT(cm.id) as unread_count
       FROM chat_rooms cr
       LEFT JOIN chat_messages cm ON cr.id = cm.room_id
       WHERE cr.room_type = 'direct'
       AND (cr.participant_1 = $1 OR cr.participant_2 = $1)
       AND cm.sender_id != $1
       AND cm.is_read = false
       GROUP BY cr.id`,
      [req.user.id]
    );

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.unread_count), 0);

    res.json({
      success: true,
      data: {
        total_unread: total,
        rooms: result.rows
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
};
