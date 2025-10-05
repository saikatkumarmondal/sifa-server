const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    parent_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Category",
      default: null,
    },
    brand: {
      type: String,
      required: false,
    },
    partType: {
      type: String,
      required: false,
    },
    material: {
      type: String,
      required: false,
    },
    dimensions: {
      type: String,
      required: false,
    },
    installSize: {
      type: String,
      required: false,
    },
    faceplateSize: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    application: {
      type: String,
      required: false,
    },
    warrantyTime: {
      type: String,
      required: false,
    },
    certificates: {
      type: String,
      required: false,
    },
    moq: {
      type: String,
      required: false,
    },
    shippingTerms: {
      type: String,
      required: false,
    },
    paymentTerms: {
      type: String,
      required: false,
    },
    paymentCurrency: {
      type: String,
      required: false,
    },
    packing: {
      type: String,
      required: false,
    },
    // Array of all images
    images: {
      type: [String],
      required: false,
      default: [],
    },
    // Main image (optional, first of images)
    image: {
      type: String,
      required: false,
      default: null,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
