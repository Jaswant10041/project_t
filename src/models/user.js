const { query } = require("../utils/database");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");


// Create a new user

const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

// Find user by username
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};


// Find user by ID
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

// Search users by username or full name
 
const searchUsers = async (searchKeyword) => {
  const result = await query(
    `SELECT id, username, full_name, created_at 
     FROM users 
     WHERE username ILIKE $1 
     OR full_name ILIKE $1 
     ORDER BY username ASC`,
    [`%${searchKeyword}%`]
  );
  return result.rows;
};

// Follow a user

const followUser = async (followerId, followingId) => {
    try {
        await query(
            'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
            [followerId, followingId]
        );
        return true;
    } catch (error) {
        if (error.code === '23505') { // Duplicate key error
            return false;
        }
        throw error;
    }
};

// Unfollow a user

const unfollowUser = async (followerId, followingId) => {
    const result = await query(
        'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
    );
    return result.rowCount > 0;
};

// Get followers of a user

const getFollowers = async (userId) => {
    const result = await query(
        `SELECT u.id, u.username, u.full_name, u.created_at
         FROM followers f
         JOIN users u ON f.follower_id = u.id
         WHERE f.following_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
    );
    return result.rows;
};

// Get users that a user follows

const getFollowing = async (userId) => {
    const result = await query(
        `SELECT u.id, u.username, u.full_name, u.created_at
         FROM followers f
         JOIN users u ON f.following_id = u.id
         WHERE f.follower_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
    );
    return result.rows;
};


// Get follow statistics for a user

const getFollowStatus = async (userId) => {
    const status = await query(
        `SELECT 
            (SELECT COUNT(*) FROM followers WHERE following_id = $1) as followers_count,
            (SELECT COUNT(*) FROM followers WHERE follower_id = $1) as following_count`,
        [userId]
    );
    return status.rows[0];
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus,
    searchUsers,
    getUserById,
    getUserByUsername,
    createUser

};
