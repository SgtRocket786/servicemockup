const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET /api/posts - list posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load posts" });
  }
});

// POST /api/posts - create
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const post = new Post(body);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "failed to create post", detail: err.message });
  }
});

// PUT /api/posts/:id - update
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update post" });
  }
});

// DELETE /api/posts/:id - delete
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete post" });
  }
});

module.exports = router;
