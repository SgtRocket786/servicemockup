const mongoose = require("mongoose");

const BeforeAfterSchema = new mongoose.Schema({
  before: { type: String },
  after: { type: String },
  caption: { type: String },
});

const PostSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String },
  caption: { type: String },
  excerpt: { type: String },
  content: { type: String },
  tags: { type: [String], default: [] },
  thumb: { type: String },
  gallery: { type: [String], default: [] },
  beforeAfter: { type: [BeforeAfterSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
