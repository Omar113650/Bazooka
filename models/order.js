
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
        },

        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          // required: true,
        },
        selectedOptions: [
          {
            level: String,
            choice: String,
          },
        ],
        quantity: { type: Number,
          //  required: true 
          },
        totalPrice: { type: Number,
          //  required: true 
          },
      },
    ],
    totalAmount: { type: Number, 
      // required: true
     },
    phone: { type: String,
      //  required: true 
      },
    couponUsed: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    city: {
      type: String,
      enum: [],
      // required: true,
    },
    region: {
      type: String,
      enum: []
      // required: true,
    },
    street: {
      type: String,
      // required: true,
    },
    phone_main: {
      type: String,
      // required: true,
    },
    phone: {
      type: String,
    },
    numberOfHome: {
      type: String,
    },
    numberOfFloor: {
      type: String,
    },
    numberOfApartment: {
      type: String,
    },
    landmark: {
      type: String, // معلم قريب (اختياري)
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
