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
    origin: [
      "http://localhost:5173",
      "http://148.66.154.205:7777",
      "https://nbsifa.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/auth", authRouter);
app.use("/categories", categoryRoute);
app.use("/spare-parts", sparePartsRouter);
// Connect DB and start server
connectDB()
  .then(() => {
    console.log("Database connected...");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
