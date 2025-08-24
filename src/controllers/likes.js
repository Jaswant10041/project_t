// TODO: Implement likes controller
// This controller should handle:
// - Liking posts
// - Unliking posts
// - Getting likes for a post
// - Getting posts liked by a user

const { 
    likePost, 
    unlikePost, 
    getPostLikes, 
    getUserLikes,
    hasUserLikedPost 
} = require('../models/like');
const { getPostById } = require('../models/post');
const logger = require("../utils/logger");


// Like a post

const like = async (req, res) => {
    try {
        const { post_id } = req.body;
        const userId = req.user.id;

        // Check if post exists
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if already liked
        const hasLiked = await hasUserLikedPost(userId, post_id);
        if (hasLiked) {
            return res.status(400).json({ error: 'Post already liked' });
        }

        await likePost(userId, post_id);
        res.status(201).json({ message: 'Post liked successfully' });
    } catch (error) {
        logger.error('Like post error:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

// Unlike a post

const unlike = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const success = await unlikePost(userId, post_id);
        if (!success) {
            return res.status(400).json({ error: 'Post not liked' });
        }

        res.json({ message: 'Post unliked successfully' });
    } catch (error) {
        logger.error('Unlike post error:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
};

// Get likes for a post

const getPostLikesList = async (req, res) => {
    try {
        const { post_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const likes = await getPostLikes(post_id, limit, offset);
        res.json({
            likes,
            pagination: {
                page,
                limit,
                hasMore: likes.length === limit
            }
        });
    } catch (error) {
        logger.error('Get post likes error:', error);
        res.status(500).json({ error: 'Failed to get likes' });
    }
};

// Get posts liked by a user

const getUserLikesList = async (req, res) => {
    try {
        const { user_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const likes = await getUserLikes(user_id, limit, offset);
        res.json({
            likes,
            pagination: {
                page,
                limit,
                hasMore: likes.length === limit
            }
        });
    } catch (error) {
        logger.error('Get user likes error:', error);
        res.status(500).json({ error: 'Failed to get liked posts' });
    }
};

module.exports = {
    like,
    unlike,
    getPostLikesList,
    getUserLikesList
};
