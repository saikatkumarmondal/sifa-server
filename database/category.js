const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Category name
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null for top-level categories
    },
    image: {
      type: String, // Optional category image/icon
      default: null,
    },
    description: {
      type: String, // Optional description
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
