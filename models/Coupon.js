import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String,unique: true },
  discountPercent: { type: Number },
  expiresAt: { type: Date, },
});

export const Coupon = mongoose.model("Coupon", couponSchema);
