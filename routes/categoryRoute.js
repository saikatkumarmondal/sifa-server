const express = require("express");

const upload = require("../middlewares/upload");
const path = require("path");
const fs = require("fs");
const nestedCategories = require("../utils/nestedcategories");
const Category = require("../database/category");

const categoryRoute = express.Router();
// Helper to recursively populate children
const getNestedCategory = async (category) => {
  const children = await Category.find({ parent_category_id: category._id });
  const nestedChildren = await Promise.all(children.map(getNestedCategory));

  return {
    _id: category._id,
    name: category.name,
    description: category.description || "", // ✅ include description
    image: category.image,
    children: nestedChildren,
  };
};
// Recursive function to delete category and its children
const deleteCategoryRecursive = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) return;

  // Delete image if exists
  if (category.image) {
    const imagePath = path.join(__dirname, "..", category.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Find children
  const children = await Category.find({ parent_category_id: categoryId });

  // Recursively delete children
  for (const child of children) {
    await deleteCategoryRecursive(child._id);
  }

  // Delete the category itself
  await Category.findByIdAndDelete(categoryId);
};

// Recursive search for category by ID
const findCategoryById = (categories, id) => {
  for (const cat of categories) {
    if (cat._id.toString() === id.toString()) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Add category (parent or child) with optional image

categoryRoute.post(
  "/add-category",
  upload.array("images"),
  async (req, res) => {
    try {
      const data = req.body;

      const newCategory = new Category({
        ...data,
        parent_category_id: data.parent_category_id || null,
        images: req.files
          ? req.files.map((f) => f.path.replace(/\\/g, "/"))
          : [],
      });

      if (newCategory.images.length > 0) {
        newCategory.image = newCategory.images[0];
      }

      await newCategory.save();

      const categories = await Category.find({});
      const tree = nestedCategories(categories);

      res.status(201).json({ success: true, newCategory, tree });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET single category by ID (can be parent, child, grandchild)
categoryRoute.get("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all categories
    const categories = await Category.find({}).lean();

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found in DB",
      });
    }

    // Build nested tree
    const nested = nestedCategories(categories);

    // Find the requested category
    const category = findCategoryById(nested, id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// get all categories:
categoryRoute.get("/get-categories", async (req, res) => {
  try {
    // Use .lean() to get plain JS objects for nestedCategories
    const categories = await Category.find({}).lean();

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Category Not Found..!",
        data: [],
      });
    }

    const nestedCats = nestedCategories(categories);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: nestedCats,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
// get a single category parent
categoryRoute.get("/category/parent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    // Fetch single category as plain JS object
    const category = await Category.findById(id).lean();
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    // To get nested children, fetch all categories first
    const allCategories = await Category.find({}).lean();

    const nestedCategory = getNestedCategory(allCategories, category._id);

    res.json({ success: true, data: nestedCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// categoryRoute.post(
//   "/add-category",

//   upload.any("image"),
//   async (req, res) => {
//     try {
//       const { name, parent_category_id, description } = req.body;

//       if (!name) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Category name is required" });
//       }

//       const newCategoryData = { name };

//       // Add description if provided
//       if (description) newCategoryData.description = description;

//       // Assign parent if provided
//       if (parent_category_id)
//         newCategoryData.parent_category_id = parent_category_id;

//       // Optional image
//       if (req.files && req.files.length > 0) {
//         // Store all uploaded image paths
//         newCategoryData.images = req.files.map((f) =>
//           f.path.replace("\\", "/")
//         );

//         // Optional: set the first image as the main image
//         newCategoryData.image = newCategoryData.images[0];
//       }
//       const newCategory = new Category(newCategoryData);
//       await newCategory.save();

//       res.status(201).json({
//         success: true,
//         message: "Category added successfully",
//         newCategory,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }
// );

// categoryRoute.get("/get-categories", async (req, res) => {
//   try {
//     const categories = await Category.find({});
//     if (!categories) {
//       return res.status(200).json({
//         success: true,
//         message: "Category Not Found..!",
//         data: [],
//       });
//     }
//     const nestedCats = nestedCategories(categories);
//     return res.status(200).json({
//       success: true,
//       message: "Categories fetch successfully",
//       data: nestedCats,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// categoryRoute.put(
//   "/update-category/:id",
//   upload.any("images"),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { name, parent_category_id, description } = req.body;

//       const category = await Category.findById(id);
//       if (!category)
//         return res
//           .status(404)
//           .json({ success: false, message: "Category not found" });

//       // Delete old image if new one uploaded
//       if (req.file && category.image) {
//         const oldImagePath = path.join(__dirname, "..", category.image); // path to old file
//         fs.unlink(oldImagePath, (err) => {
//           if (err) console.error("Failed to delete old image:", err);
//         });
//       }

//       // Update fields
//       if (name) category.name = name;
//       if (description) category.description = description;
//       if (parent_category_id) category.parent_category_id = parent_category_id;
//       if (req.file) category.image = req.file.path;

//       await category.save();

//       res.status(200).json({
//         success: true,
//         message: "Category updated successfully",
//         data: category,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }
// );
// categoryRoute.get("/category/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const category = await Category.findById(id);
//     if (!category)
//       return res
//         .status(404)
//         .json({ success: false, message: "Category not found" });

//     const nestedCategory = await getNestedCategory(category);

//     res.json({ success: true, data: nestedCategory });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// update category:
categoryRoute.put(
  "/update-category/:id",
  upload.any("images"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle parent_category_id properly
      if (
        updateData.parent_category_id === "" ||
        updateData.parent_category_id === null
      ) {
        updateData.parent_category_id = null; // set null instead of empty string
      }

      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => file.path.replace("\\", "/"));
        updateData.images = images;
        updateData.image = images[0]; // first image as main
      }

      const category = await Category.findById(id);
      if (!category)
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });

      // Update fields
      for (let key in updateData) {
        category[key] = updateData[key];
      }

      await category.save();

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

categoryRoute.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Call recursive delete
    await deleteCategoryRecursive(id);

    res
      .status(200)
      .json({ message: "Category and all its children deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = categoryRoute;
