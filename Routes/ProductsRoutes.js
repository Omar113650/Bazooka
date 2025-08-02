import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../Controllers/ProductsController.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middleware/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post(
  "/ add-product",
  VerifyTokenAdmin,
  upload.single("Image"),
  createProduct
);
router.get("/get-all-product", VerifyToken, getAllProducts);
router.get("/:id", VerifyTokenAdmin, ValidatedID, getProductById);
router.put("/update-product/:id", VerifyTokenAdmin, ValidatedID, updateProduct);
router.delete("/:id", deleteProduct);
router.get("/category/:categoryId", ValidatedID, getProductsByCategory);

export default router;
