const pool = require('../config/database');

// Search and filter users in directory
exports.searchUsers = async (req, res) => {
  try {
    const {
      name,
      marga,
      gender,
      city,
      province,
      min_age,
      max_age,
      page = 1,
      limit = 20
    } = req.query;

    // Build WHERE clause dynamically
    const conditions = ['is_active = true'];
    const values = [];
    let paramCount = 1;

    if (name) {
      conditions.push(`full_name ILIKE $${paramCount++}`);
      values.push(`%${name}%`);
    }

    if (marga) {
      conditions.push(`marga ILIKE $${paramCount++}`);
      values.push(`%${marga}%`);
    }

    if (gender) {
      conditions.push(`gender = $${paramCount++}`);
      values.push(gender);
    }

    if (city) {
      conditions.push(`city ILIKE $${paramCount++}`);
      values.push(`%${city}%`);
    }

    if (province) {
      conditions.push(`province ILIKE $${paramCount++}`);
      values.push(`%${province}%`);
    }

    // Age filter
    if (min_age || max_age) {
      if (min_age) {
        conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) >= $${paramCount++}`);
        values.push(parseInt(min_age));
      }
      if (max_age) {
        conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) <= $${paramCount++}`);
        values.push(parseInt(max_age));
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get users
    const usersQuery = `
      SELECT 
        id, full_name, marga, email, gender, date_of_birth,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        phone, city, province, avatar, batak_id_card, created_at
      FROM users
      ${whereClause}
      ORDER BY full_name ASC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `;
    
    values.push(parseInt(limit), offset);
    const usersResult = await pool.query(usersQuery, values);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        id, full_name, marga, email, gender, date_of_birth,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        phone, city, province, avatar, batak_id_card, created_at
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count,
        COUNT(DISTINCT city) as total_cities,
        COUNT(DISTINCT province) as total_provinces,
        COUNT(DISTINCT marga) as total_margas
      FROM users
      WHERE is_active = true
    `);

    const topMargas = await pool.query(`
      SELECT marga, COUNT(*) as count
      FROM users
      WHERE is_active = true
      GROUP BY marga
      ORDER BY count DESC
      LIMIT 10
    `);

    const topCities = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM users
      WHERE is_active = true AND city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_margas: topMargas.rows,
        top_cities: topCities.rows
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};
