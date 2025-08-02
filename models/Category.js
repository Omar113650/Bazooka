import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      enum: [
        "offers",
        "chicken sandwich",
        "beef sandwich",
        "family meal",
        "meals",
        "extra",
        "appetizers",
        "soft drinks",
        "desserts",
      ],
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", CategorySchema);
