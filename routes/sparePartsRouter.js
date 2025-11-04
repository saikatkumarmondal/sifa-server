const express = require("express");
const sparePartsRouter = express.Router();
const SparePart = require("../database/spareparts");
const upload = require("../middlewares/upload");
const Category = require("../database/category");
const fs = require("fs");
const path = require("path");

// Helper to delete a file
const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const getAllChildCategoryIds = async (parentId) => {
  const categories = await Category.find().lean();
  const result = [];

  const findChildren = (id) => {
    result.push(id); // include this category
    categories
      .filter((cat) => String(cat.parentId) === String(id))
      .forEach((child) => findChildren(child._id));
  };

  findChildren(parentId);
  return result; // array of all ids including parent
};

// POST: Create spare part with images
sparePartsRouter.post("/", upload.array("images"), async (req, res) => {
  try {
    const {
      name,
      brand,
      partType,
      material,
      dimensions,
      installSize,
      faceplateSize,
      weight,
      application,
      warrantyTime,
      certificates,
      moq,
      shippingTerms,
      paymentTerms,
      paymentCurrency,
      packing,
      deliveryTime, // updated from description
      categoryId,
    } = req.body;

    // Convert uploaded files to URLs
    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

    const image = images.length > 0 ? images[0] : null;

    const sparePart = new SparePart({
      name,
      brand,
      partType,
      material,
      dimensions,
      installSize,
      faceplateSize,
      weight,
      application,
      warrantyTime,
      certificates,
      moq,
      shippingTerms,
      paymentTerms,
      paymentCurrency,
      packing,
      deliveryTime,
      categoryId,
      images,
      image,
    });

    const saved = await sparePart.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create spare part" });
  }
});

// Get all Spare Parts Using
sparePartsRouter.get("/by-category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get parent + all children/grandchildren ids
    const categoryIds = await getAllChildCategoryIds(id);

    // Fetch all spare parts in these categories
    const parts = await SparePart.find({ categoryId: { $in: categoryIds } })
      .populate("categoryId")
      .lean();

    res.json(parts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch spare parts by category" });
  }
});
// GET all spare parts
sparePartsRouter.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = categoryId ? { categoryId } : {};
    const parts = await SparePart.find(query).populate("categoryId").lean();
    res.json(parts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch spare parts" });
  }
});

// GET single spare part by ID
sparePartsRouter.get("/:id", async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id)
      .populate("categoryId")
      .lean();
    if (!part) return res.status(404).json({ error: "Spare part not found" });
    res.json(part);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch spare part" });
  }
});

// PUT: Update spare part with optional new images
sparePartsRouter.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;

    const part = await SparePart.findById(id);
    if (!part) return res.status(404).json({ error: "Spare part not found" });

    // Destructure all fields from req.body
    const {
      name,
      brand,
      partType,
      material,
      dimensions,
      installSize,
      faceplateSize,
      weight,
      application,
      warrantyTime,
      certificates,
      moq,
      shippingTerms,
      paymentTerms,
      paymentCurrency,
      packing,
      description,
      categoryId,
    } = req.body;

    let updateData = {
      name,
      brand,
      partType,
      material,
      dimensions,
      installSize,
      faceplateSize,
      weight,
      application,
      warrantyTime,
      certificates,
      moq,
      shippingTerms,
      paymentTerms,
      paymentCurrency,
      packing,
      description,
      categoryId,
    };

    // Handle new uploaded images
    if (req.files.length > 0) {
      // Delete old images
      part.images.forEach((img) => {
        const filePath = path.join(__dirname, "../uploads", img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      const images = req.files.map((file) => file.filename);
      updateData.images = images;
      updateData.image = images.length > 0 ? images[0] : null;
    }

    const updated = await SparePart.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update spare part" });
  }
});

// DELETE: Delete spare part and its images
sparePartsRouter.delete("/:id", async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) return res.status(404).json({ error: "Spare part not found" });

    // Delete images from uploads folder
    part.images.forEach((img) => {
      const filePath = path.join(__dirname, "../uploads", img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await SparePart.findByIdAndDelete(req.params.id);
    res.json({ message: "Spare part deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete spare part" });
  }
});

module.exports = sparePartsRouter;
