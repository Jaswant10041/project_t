// Done: Implement comments controller
// Done: Implement createComment function
// Done: Implement updateComment function
// Done: Implement deleteComment function
// Done: Implement getPostComments function

const { 
    createComment,
    updateComment,
    deleteComment,
    getPostComments,
    getCommentById
} = require('../models/comment');
const { getPostById } = require('../models/post');
const logger = require("../utils/logger");

// Create a new comment on a post

const create = async (req, res) => {
    try {
        const { post_id, content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if post exists
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await createComment(userId, post_id, content);
        res.status(201).json(comment);
    } catch (error) {
        logger.critical('Create comment error:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};


// Update an existing comment
const update = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if comment exists and belongs to user
        const existingComment = await getCommentById(comment_id);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existingComment.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this comment' });
        }

        const updatedComment = await updateComment(comment_id, content);
        res.json(updatedComment);
    } catch (error) {
        logger.critical('Update comment error:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

// Delete a comment

const remove = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const userId = req.user.id;

        // Check if comment exists and belongs to user
        const comment = await getCommentById(comment_id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await deleteComment(comment_id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        logger.critical('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};


// Get comments for post with pagination limit 20

const getForPost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Check if post exists
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = await getPostComments(post_id, limit, offset);
        res.json({
            comments,
            pagination: {
                page,
                limit,
                hasMore: comments.length === limit
            }
        });
    } catch (error) {
        logger.critical('Get post comments error:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
};


module.exports = {
    create,
    update,
    remove,
    getForPost
};
