const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { create, update, remove, getForPost } = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 * Handles creating, updating, deleting, and retrieving comments
 */


// Create a new comment
router.post("/add", authenticateToken, create);

// Update an existing comment
router.put("/update/:comment_id", authenticateToken, update);

// Delete a comment
router.delete("/delete/:comment_id", authenticateToken, remove);

// Get comments for a post
router.get("/post/:post_id", getForPost);

module.exports = router;
