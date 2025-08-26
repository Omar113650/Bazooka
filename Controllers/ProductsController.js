import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// @desc   Create Product
// @route  POST /api/Product
// @access Admin
export const createProduct = asyncHandler(async (req, res) => {
  if (typeof req.body.variations === "string") {
    try {
      req.body.variations = JSON.parse(req.body.variations);
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON in variations" });
    }
  }

  // بعد الـ parsing نعمل destructuring
  const { title, description, basePrice, variations, categoryId } = req.body;

  if (!title || !basePrice || !categoryId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const result = await cloudinaryUploadImage(req.file.buffer);
  if (!result?.secure_url) {
    return res.status(500).json({ message: "Image upload to cloud failed" });
  }

  const newItem = await Product.create({
    title,
    description,
    basePrice,
    variations, // ده دلوقتي بقى Array
    category: categoryId,
    Image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  res.status(201).json({
    message: "Product item created successfully",
    item: newItem,
  });
});

// @desc   Get All Products
// @route  GET /api/Product
// @access Public
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate("category", "name");
 
  if(!products){
    return res.status(404).json({message:"Not found product"})
  }
  res.status(200).json(products);
});

// @desc   Get Product by ID
// @route  GET /api/Product/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

// @desc   Update Product
// @route  PUT /api/products/:id
// @access Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, basePrice, variations, categoryId } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  let imageUpdate = product.Image;

  if (req.file) {
    if (product.Image?.publicId) {
      await cloudinaryRemoveImage(product.Image.publicId);
    }

    const uploaded = await cloudinaryUploadImage(req.file.buffer);
    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    imageUpdate = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $set: {
        title: title || product.title,
        description: description || product.description,
        basePrice: basePrice || product.basePrice,
        variations: variations || product.variations,
        category: categoryId || product.category,
        Image: imageUpdate,
      },
    },
    { new: true }
  );

  res.status(200).json({ message: "Product updated", item: updatedProduct });
});

// @desc   Delete Product
// @route  DELETE /api/Product/:id
// @access Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.Image?.publicId) {
    await cloudinaryRemoveImage(product.Image.publicId);
  }

  await product.deleteOne();
  res.status(200).json({ message: "Product deleted" });
});

// @desc   Get Products by Category
// @route  GET /api/Product/category/:categoryId
// @access Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  const products = await Product.find({ category: categoryId });
  res.status(200).json(products);
});
