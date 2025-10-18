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

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routes without /api/
app.use("/categories", categoryRoute);
app.use("/spare-parts", sparePartsRouter);
app.use("/auth", authRouter);

// Serve React build (optional)
// app.use(express.static(path.join(__dirname, "../client/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
// });

// Connect DB and start server

connectDB()
  .then(async () => {
    console.log("Database connected...");

    // ✅ Only insert after connection
    try {
      const cat = await category.create({ name: "test" });
      console.log("Category inserted:", cat);
    } catch (err) {
      console.error("Failed to insert category:", err.message);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
