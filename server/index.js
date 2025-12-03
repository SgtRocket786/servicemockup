require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || "http://localhost:" + PORT;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to mongo
async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn(
      "MONGO_URI not set; server will run but DB calls will fail until configured."
    );
  } else {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  }
}
main().catch((err) => console.error("Mongo connection error", err));

// mount API routes
const postsRouter = require("./routes/posts");
const uploadsRouter = require("./routes/uploads");
app.use("/api/posts", postsRouter);
app.use("/api/uploads", uploadsRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok", api: ["/api/posts", "/api/uploads"] });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
