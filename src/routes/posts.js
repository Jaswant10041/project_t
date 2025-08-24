const express = require("express");
const { validateRequest, createPostSchema, updatePostSchema } = require("../utils/validation");
const {
	create,
	getById,
	getUserPosts,
	getMyPosts,
	remove,
	getFeed,
	update,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Create post
router.post("/create", authenticateToken, validateRequest(createPostSchema), create);

// Get current user's posts
router.get("/my", authenticateToken, getMyPosts);

// Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// Get feed of posts from followed users
router.get("/feed", authenticateToken, getFeed);

// Get a single post by ID
router.get("/:post_id", optionalAuth, getById);

// Delete a post
router.delete("/:post_id", authenticateToken, remove);

// Update a post
router.put("/:post_id", authenticateToken, validateRequest(updatePostSchema), update);

module.exports = router;
