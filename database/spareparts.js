// models/SparePart.js
const mongoose = require("mongoose");

const SparePartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    partType: { type: String },
    material: { type: String },
    dimensions: { type: String },
    installSize: { type: String },
    faceplateSize: { type: String },
    weight: { type: String },
    application: { type: String },
    warrantyTime: { type: String },
    certificates: { type: String },
    moq: { type: String },
    shippingTerms: { type: String },
    paymentTerms: { type: String },
    paymentCurrency: { type: String },
    packing: { type: String },
    images: { type: [String], default: [] },
    image: { type: String, default: null },
    deliveryTime: { type: String },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SparePart", SparePartSchema);
