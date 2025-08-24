const { query } = require("../utils/database");

// Create a new comment on a post

async function createComment(userId, postId, content) {
    const sql = `
        INSERT INTO comments (user_id, post_id, content, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING 
            id,
            user_id,
            post_id,
            content,
            created_at,
            updated_at
    `;
    const result = await query(sql, [userId, postId, content]);
    return result.rows[0];
}

// Update an existing comment

async function updateComment(commentId, content) {
    const sql = `
        UPDATE comments
        SET 
            content = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING 
            id,
            user_id,
            post_id,
            content,
            created_at,
            updated_at
    `;
    const result = await query(sql, [content, commentId]);
    return result.rows[0];
}

// Delete a comment by ID

async function deleteComment(commentId) {
    const sql = `
        DELETE FROM comments
        WHERE id = $1
    `;
    const result = await query(sql, [commentId]);
    return result.rowCount > 0;
}

// Get a comment by its ID

async function getCommentById(commentId) {
    const sql = `
        SELECT 
            c.id,
            c.user_id,
            c.post_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
    `;
    const result = await query(sql, [commentId]);
    return result.rows[0] || null;
}

// Get comments for a specific post with pagination

async function getPostComments(postId, limit, offset) {
    const sql = `
        SELECT 
            c.id,
            c.user_id,
            c.post_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [postId, limit, offset]);
    return result.rows;
}

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getCommentById,
    getPostComments
};
