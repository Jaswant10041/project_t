const { query } = require("../utils/database");

// Create a new post

const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, user_id, content, media_url, comments_enabled, created_at, updated_at`,
    [user_id, content, media_url, comments_enabled],
  );

  // Get full post data including user info
  const post = await getPostById(result.rows[0].id);
  return post;
};

// Get post by ID

const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId],
  );

  return result.rows[0] || null;
};

// Get posts by user ID

const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

// Delete a post
const deletePost = async (postId, userId) => {
  // First delete all related likes
  await query(
    "DELETE FROM likes WHERE post_id = $1",
    [postId]
  );

  // Then delete all related comments
  await query(
    "DELETE FROM comments WHERE post_id = $1",
    [postId]
  );

  // Finally delete the post itself
  const result = await query(
    "DELETE FROM posts WHERE id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};

// Get posts for user's feed

const getPostsFeed = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE (
       p.user_id IN (
         SELECT following_id 
         FROM followers 
         WHERE follower_id = $1
       ) 
       OR p.user_id = $1
     )
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

// Update a post

const updatePost = async (postId, userId, updates) => {
  const fields = [];
  const values = [postId, userId];
  let valueCount = 3;

  // Build dynamic update query
  if (updates.content !== undefined) {
    fields.push(`content = $${valueCount}`);
    values.push(updates.content);
    valueCount++;
  }
  if (updates.media_url !== undefined) {
    fields.push(`media_url = $${valueCount}`);
    values.push(updates.media_url);
    valueCount++;
  }
  if (updates.comments_enabled !== undefined) {
    fields.push(`comments_enabled = $${valueCount}`);
    values.push(updates.comments_enabled);
    valueCount++;
  }

  // If no fields to update, return null
  if (fields.length === 0) {
    return null;
  }

  const result = await query(
    `UPDATE posts p
     SET ${fields.join(', ')}, updated_at = NOW()
     FROM users u
     WHERE p.id = $1 
     AND p.user_id = $2 
     AND p.user_id = u.id
     RETURNING p.*, u.username, u.full_name`,
    values
  );

  return result.rows[0] || null;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getPostsFeed,
  updatePost
};
