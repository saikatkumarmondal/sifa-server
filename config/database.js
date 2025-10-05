const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://sifa_db_2:vfgnAK9cUg5PNBCB@saikat.r5nuz5u.mongodb.net/"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log(error.message);
  }
};
//sifa_db_2
//vfgnAK9cUg5PNBCB
module.exports = connectDB;
