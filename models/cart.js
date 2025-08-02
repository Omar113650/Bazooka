import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    selectedOptions: { type: Array, default: [] },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    phone: { type: String, required: true },
    CommentForPay: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
