import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    title: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

     variations: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
