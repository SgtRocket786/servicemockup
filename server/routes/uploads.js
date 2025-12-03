const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// store files in server/uploads and keep original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name =
      Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/uploads - accept multiple files under field 'files' and return URLs
router.post("/", upload.array("files", 20), function (req, res) {
  const base = process.env.BASE_URL || req.protocol + "://" + req.get("host");
  const files = (req.files || []).map((f) => ({
    fieldname: f.fieldname,
    originalname: f.originalname,
    size: f.size,
    url: base + "/uploads/" + f.filename,
  }));
  res.json({ uploaded: files });
});

module.exports = router;
