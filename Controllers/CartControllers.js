import asyncHandler from "express-async-handler";
import { Cart } from "../models/cart.js";
import { Order } from "../models/order.js";


export const GetCartSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const cartItems = await Cart.find({ userId }).populate("product");

  if (!cartItems.length) {
    return res.status(404).json({ message: "السلة فارغة" });
  }

  let total = 0;

  cartItems.forEach((item) => {
    const price = item.product.price || 0;
    total += price * item.quantity;
  });

  const deliveryFee = 35;
  const deliveryTimeMinutes = 60;
  const taxIncluded = true;
  const taxText = taxIncluded ? "السعر شامل الضريبة" : "غير شامل الضريبة";

  const grandTotal = total + deliveryFee;

  res.status(200).json({
    cartItems,
    summary: {
      subtotal: `${total.toFixed(2)} جنيه`,
      taxInfo: taxText,
      deliveryFee: `${deliveryFee.toFixed(2)} جنيه`,
      deliveryTime: `${deliveryTimeMinutes} دقيقة`,
      grandTotal: `${grandTotal.toFixed(2)} جنيه`
    }
  });
});












