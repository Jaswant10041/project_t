const { query } = require("../utils/database");

// Like a post

const likePost = async (userId, postId) => {
    try {
        await query(
            'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
            [userId, postId]
        );
        return true;
    } catch (error) {
        if (error.code === '23505') { // Duplicate key error
            return false;
        }
        throw error;
    }
};

// Unlike a post

const unlikePost = async (userId, postId) => {
    const result = await query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
    );
    return result.rowCount > 0;
};

// Get likes for a post

const getPostLikes = async (postId, limit = 20, offset = 0) => {
    const result = await query(
        `SELECT l.*, u.username, u.full_name
         FROM likes l
         JOIN users u ON l.user_id = u.id
         WHERE l.post_id = $1
         ORDER BY l.created_at DESC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
    );
    return result.rows;
};

// Get posts liked by a user

const getUserLikes = async (userId, limit = 20, offset = 0) => {
    const result = await query(
        `SELECT p.*, u.username, u.full_name,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
         FROM likes l
         JOIN posts p ON l.post_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE l.user_id = $1
         ORDER BY l.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

// Check if a user has liked a post

const hasUserLikedPost = async (userId, postId) => {
    const result = await query(
        'SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2)',
        [userId, postId]
    );
    return result.rows[0].exists;
};

module.exports = {
    likePost,
    unlikePost,
    getPostLikes,
    getUserLikes,
    hasUserLikedPost
};
