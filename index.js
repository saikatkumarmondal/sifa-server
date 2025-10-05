const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const path = require("path");
const categoryRoute = require("./routes/categoryRoute");
const PORT = process.env.PORT || 7777;

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // allow all used HTTP methods
    credentials: true, // allow cookies/authorization headers if you use them
  })
);

app.use(express.json());
// Serve uploaded images

// 1. Point Express to your React build folder
app.use(express.static(path.join(__dirname, "dist")));

// 2. For any GET request not handled by your API, serve the React app's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", authRouter);
app.use("/", categoryRoute);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Database connection established...");
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
