const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { 
    follow, 
    unfollow,
    getMyFollowers, 
    getMyFollowing,
    getFollowDetails,
    search
} = require("../controllers/users");

const router = express.Router();

// Follow
router.post('/:userId/follow', authenticateToken, follow);

// Unfollow
router.delete('/:userId/unfollow', authenticateToken, unfollow);

// Followers
router.get('/followers', authenticateToken, getMyFollowers);
// Following
router.get('/following', authenticateToken, getMyFollowing);
//followStatus
router.get('/status', authenticateToken, getFollowDetails);

// User search
router.post('/search', authenticateToken, search);

module.exports = router;
