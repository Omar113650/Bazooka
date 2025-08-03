import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} from "../utils/Cloudinary.js";

// import { Category } from "../models/Category.js";

// @desc   Create Product
// @route  POST /api/Product
// @access Admin
export const createOffers = asyncHandler(async (req, res) => {
  let { title, description, basePrice, variations, categoryId } = req.body;

  if (!title || !basePrice || !categoryId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // ✅ Parse variations if it's a string
  if (typeof variations === "string") {
    try {
      variations = JSON.parse(variations);
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON in variations" });
    }
  }

  // ✅ Check image
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  // ✅ Upload to Cloudinary
  const result = await cloudinaryUploadImage(req.file.buffer);
  if (!result.secure_url) {
    return res.status(500).json({ message: "Image upload to cloud failed" });
  }

  // ✅ Create Product
  const newItem = await Product.create({
    title,
    description,
    basePrice,
    variations,
    category: categoryId, // ✅ استخدم الحقل الصحيح اللي السكيمة بتتوقعه
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
export const getAllOffers = asyncHandler(async (req, res) => {
  const products = await Product.find();
    if (!products) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(products);
});

// @desc   Update Product
// @route  PUT /api/products/:id
// @access Admin
export const updateOffers = asyncHandler(async (req, res) => {
  const { title, description, basePrice,variations } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  
  if (req.file) {
    if (customer.Avatar?.publicId) {
      await cloudinaryRemoveImage(customer.Avatar.publicId);
    }

    const uploaded = await cloudinaryUploadImage(req.file.buffer);
    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    updates.Avatar = {
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
        variations : variations || product.variations,
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
   if (customer?.Avatar?.publicId) {
    await cloudinaryRemoveImage(customer.Avatar.publicId);
  }
  await product.deleteOne();
  res.status(200).json({ message: "Product deleted" });
});

// @desc   Get top Products
// @route  GET /api/Product
// @access Public
export const GetTopOffers = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .sort({ basePrice: "asc" })
    .limit(5);
  res.status(200).json(products);
});




































