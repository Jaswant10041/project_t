const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { like, unlike, getPostLikesList, getUserLikesList } = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 * Handles liking/unliking posts and retrieving like information
 */

// Like a post
router.post("/like", authenticateToken, like);

// Unlike a post
router.delete("/:post_id", authenticateToken, unlike);

// Get likes for a post
router.get("/post/:post_id", getPostLikesList);

// Get posts liked by a user
router.get("/user/:user_id", authenticateToken, getUserLikesList);

module.exports = router;
