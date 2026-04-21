const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// Create community
exports.createCommunity = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { name, description, category, city, province } = req.body;
    let avatar = null;

    if (req.file) {
      avatar = `/uploads/communities/${req.file.filename}`;
    }

    const result = await client.query(
      `INSERT INTO communities (name, description, category, city, province, avatar, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, category, city, province, avatar, req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating community'
    });
  } finally {
    client.release();
  }
};

// Get all communities with pagination
exports.getCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, province, category } = req.query;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    if (city) {
      conditions.push(`c.city ILIKE $${paramCount++}`);
      values.push(`%${city}%`);
    }

    if (province) {
      conditions.push(`c.province ILIKE $${paramCount++}`);
      values.push(`%${province}%`);
    }

    if (category) {
      conditions.push(`c.category = $${paramCount++}`);
      values.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM communities c
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get communities with member count
    const query = `
      SELECT 
        c.*,
        u.full_name as creator_name,
        COUNT(cm.id) as member_count
      FROM communities c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN community_members cm ON c.id = cm.community_id
      ${whereClause}
      GROUP BY c.id, u.full_name
      ORDER BY c.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `;
    
    values.push(parseInt(limit), offset);
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: {
        communities: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching communities'
    });
  }
};

// Get community by ID
exports.getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;

    const result = await pool.query(
      `SELECT 
        c.*,
        u.full_name as creator_name,
        u.marga as creator_marga,
        COUNT(cm.id) as member_count
       FROM communities c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN community_members cm ON c.id = cm.community_id
       WHERE c.id = $1
       GROUP BY c.id, u.full_name, u.marga`,
      [communityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community'
    });
  }
};

// Update community
exports.updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, description, category, city, province } = req.body;

    // Check if user is leader
    const roleCheck = await pool.query(
      `SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only community leaders can update community details'
      });
    }

    let avatar = null;
    if (req.file) {
      avatar = `/uploads/communities/${req.file.filename}`;
      
      // Delete old avatar
      const oldResult = await pool.query('SELECT avatar FROM communities WHERE id = $1', [communityId]);
      if (oldResult.rows[0]?.avatar) {
        const oldPath = path.join(__dirname, '../../', oldResult.rows[0].avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (category) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (city) {
      updates.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (province) {
      updates.push(`province = $${paramCount++}`);
      values.push(province);
    }
    if (avatar) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(communityId);

    const result = await pool.query(
      `UPDATE communities SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Community updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating community'
    });
  }
};

// Delete community
exports.deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if user is leader
    const roleCheck = await pool.query(
      `SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only community leaders can delete the community'
      });
    }

    await pool.query('DELETE FROM communities WHERE id = $1', [communityId]);

    res.json({
      success: true,
      message: 'Community deleted successfully'
    });

  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting community'
    });
  }
};

// Join community
exports.joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if already a member
    const memberCheck = await pool.query(
      `SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }

    const result = await pool.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES ($1, $2, 'member')
       RETURNING *`,
      [communityId, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully joined the community',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining community'
    });
  }
};

// Leave community
exports.leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if user is leader
    const roleCheck = await pool.query(
      `SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }

    if (roleCheck.rows[0].role === 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Community leader cannot leave. Please transfer leadership first or delete the community.'
      });
    }

    await pool.query(
      `DELETE FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Successfully left the community'
    });

  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving community'
    });
  }
};

// Get community members
exports.getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM community_members WHERE community_id = $1',
      [communityId]
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT 
        cm.id, cm.role, cm.joined_at,
        u.id as user_id, u.full_name, u.marga, u.email, u.avatar, u.city, u.province
       FROM community_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.community_id = $1
       ORDER BY 
         CASE cm.role
           WHEN 'leader' THEN 1
           WHEN 'vice_leader' THEN 2
           WHEN 'secretary' THEN 3
           WHEN 'treasurer' THEN 4
           WHEN 'supervisor' THEN 5
           ELSE 6
         END,
         cm.joined_at ASC
       LIMIT $2 OFFSET $3`,
      [communityId, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: {
        members: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching members'
    });
  }
};

// Assign role (leader only)
exports.assignRole = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['leader', 'vice_leader', 'secretary', 'treasurer', 'supervisor', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check if current user is leader
    const leaderCheck = await pool.query(
      `SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2`,
      [communityId, req.user.id]
    );

    if (leaderCheck.rows.length === 0 || leaderCheck.rows[0].role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only community leaders can assign roles'
      });
    }

    // Update role
    const result = await pool.query(
      `UPDATE community_members 
       SET role = $1
       WHERE id = $2 AND community_id = $3
       RETURNING *`,
      [role, memberId, communityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this community'
      });
    }

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error assigning role'
    });
  }
};

// Get my communities
exports.getMyCommunities = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.*,
        cm.role,
        cm.joined_at,
        COUNT(DISTINCT cm2.id) as member_count
       FROM community_members cm
       JOIN communities c ON cm.community_id = c.id
       LEFT JOIN community_members cm2 ON c.id = cm2.community_id
       WHERE cm.user_id = $1
       GROUP BY c.id, cm.role, cm.joined_at
       ORDER BY cm.joined_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get my communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your communities'
    });
  }
};
