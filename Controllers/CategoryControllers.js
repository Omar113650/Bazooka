import asyncHandler from "express-async-handler";
import { Category } from "../models/Category.js";

// Create
export const CreateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(403).json({ message: "please enter name" });
  }
  const NewCategory = await Category.create({ name: name.trim().toLowerCase() });
  res.status(201).json({ message: "created category success", NewCategory });
});

// Get All
export const GetCategory = asyncHandler(async (req, res) => {
  const category = await Category.find();
  if (category.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }
  res.status(200).json({ message: "find category successful", category });
});

// Delete
export const DeleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);
  res.status(200).json({ message: "Deleted successfully", deletedCategory });
});

// Update
export const UpdateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updated = await Category.findByIdAndUpdate(
    categoryId,
    { name: name.trim().toLowerCase() },
    { new: true }
  );

  res.status(200).json({ message: "Update success", updated });
});

// Count
export const Count = asyncHandler(async (req, res) => {
  const count = await Category.countDocuments();
  res.status(200).json({ message: "Count success", count });
});
