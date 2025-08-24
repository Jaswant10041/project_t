const { getUserById } = require('../models/user');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus,
    searchUsers
} = require('../models/user');
const logger = require("../utils/logger");

// Follow a user

const follow = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = parseInt(req.params.userId);

        // Check if user exists
        const userToFollow = await getUserById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent following yourself
        if (followerId === followingId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const success = await followUser(followerId, followingId);
        if (!success) {
            return res.status(400).json({ error: 'Already following this user' });
        }

        res.status(201).json({ message: 'Successfully followed user' });
    } catch (error) {
        logger.error('Follow error:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
};

// Get followers of the current user

const getMyFollowers = async (req, res) => {
    try {
        const followers = await getFollowers(req.user.id);
        res.json(followers);
    } catch (error) {
        logger.error('Get followers error:', error);
        res.status(500).json({ error: 'Failed to get followers' });
    }
};

// Get users that current user follows

const getMyFollowing = async (req, res) => {
    try {
        const following = await getFollowing(req.user.id);
        res.json(following);
    } catch (error) {
        logger.error('Get following error:', error);
        res.status(500).json({ error: 'Failed to get following users' });
    }
};


// Unfollow a user

const unfollow = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = parseInt(req.params.userId);

        // Check if user exists
        const userToUnfollow = await getUserById(followingId);
        if (!userToUnfollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        const success = await unfollowUser(followerId, followingId);
        if (!success) {
            return res.status(400).json({ error: 'Not following this user' });
        }

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        logger.error('Unfollow error:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
};

// Get follow status

const getFollowDetails = async (req, res) => {
    try {
        const status = await getFollowStatus(req.user.id);
        res.json(status);
    } catch (error) {
        logger.critical('Get status error:', error);
        res.status(500).json({ error: 'Failed to get follow details' });
    }
};


// Search users

const search = async (req, res) => {
    try {
        const q  = req.body.q;
        console.log(q);
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search term must be at least 2 characters' });
        }

        const users = await searchUsers(q.trim());
        res.json(users);
    } catch (error) {
        logger.critical('User search error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

module.exports = {
    follow,
    unfollow,
    getMyFollowers,
    getMyFollowing,
    getFollowDetails,
    search
};
