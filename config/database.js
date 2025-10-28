const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://sifa:3K9N1Sq3u4e9y60p@saikat.r5nuz5u.mongodb.net/sifaDB?retryWrites=true&w=majority&appName=Saikat",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB connected to DB: ${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    //process.exit(1);
  }
};

module.exports = connectDB;

//3K9N1Sq3u4e9y60p
//sifa
// vps mongodb url
//  "mongodb://127.0.0.1:27017/sifa",
