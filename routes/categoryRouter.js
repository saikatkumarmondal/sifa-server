const express = require("express");
const categoryRouter = express.Router();
const Category = require("../database/category");
const SparePart = require("../database/spareparts");
const upload = require("../middlewares/upload");
const fs = require("fs");
const path = require("path");

// Helper to delete a file
const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Helper to build nested tree
const buildTree = (categories, parentId = null) => {
  return categories
    .filter((cat) => String(cat.parentId) === String(parentId))
    .map((cat) => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }));
};

// POST: Create new category
categoryRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, parentId, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newCategory = new Category({
      name,
      parentId: parentId || null,
      description: description || null,
      image: req.file ? req.file.filename : null,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error("Failed to create category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// GET all categories (nested tree)
categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json(buildTree(categories));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// PUT: Update category with optional new image
categoryRouter.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const { name, parentId, description } = req.body;

    let updateData = { name, parentId, description };

    if (req.file) {
      // Delete old image if exists
      deleteFile(category.image);
      updateData.image = req.file.filename;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// GET: Fetch all spare parts for a category (including subcategories)
categoryRouter.get("/:id/spareparts", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all categories
    const categories = await Category.find().lean();

    // Recursive function to get all descendant category IDs
    const getAllCategoryIds = (categoryId) => {
      const children = categories.filter(
        (cat) => String(cat.parentId) === String(categoryId)
      );
      let ids = [categoryId];
      for (let child of children) {
        ids = ids.concat(getAllCategoryIds(child._id));
      }
      return ids;
    };

    const allCategoryIds = getAllCategoryIds(id);

    // Find all spare parts that belong to any of those categories
    const spareParts = await SparePart.find({
      categoryId: { $in: allCategoryIds },
    })
      .populate("categoryId", "name")
      .lean();

    if (!spareParts.length)
      return res.status(404).json({ message: "No spare parts found" });

    res.json(spareParts);
  } catch (err) {
    console.error("Failed to fetch spare parts by category:", err);
    res.status(500).json({ error: "Failed to fetch spare parts" });
  }
});

// DELETE: Delete category and all its children recursively, including images
categoryRouter.delete("/:id", async (req, res) => {
  try {
    const deleteRecursive = async (categoryId) => {
      const children = await Category.find({ parentId: categoryId });
      for (let child of children) {
        await deleteRecursive(child._id);
      }
      const cat = await Category.findById(categoryId);
      if (cat) {
        deleteFile(cat.image);
        await Category.findByIdAndDelete(categoryId);
      }
    };

    await deleteRecursive(req.params.id);
    res.json({ message: "Category and all its children deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = categoryRouter;
