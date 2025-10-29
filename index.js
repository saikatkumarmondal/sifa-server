const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRouter = require("./routes/auth");
const categoryRoute = require("./routes/categoryRouter");
const sparePartsRouter = require("./routes/sparePartsRouter");
const category = require("./database/category");
require("dotenv").config();

const PORT = process.env.PORT || 7777;
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://148.66.154.205:7777"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/auth", authRouter);
app.use("/categories", categoryRoute);
app.use("/spare-parts", sparePartsRouter);

// Serve React frontend
const distPath = path.join(__dirname, "client", "dist");
app.use(express.static(distPath));

// ✅ SPA fallback (works with new path-to-regexp)
app.get("/*(.*)", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Connect DB and start server
connectDB()
  .then(async () => {
    console.log("Database connected...");

    try {
      const cat = await category.create({ name: "test" });
      console.log("Category inserted:", cat);
    } catch (err) {
      console.error("Failed to insert category:", err.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
