import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({

  city: { type: String },
  Region: { type: String},

}, { timestamps: true });

export const Address = mongoose.model("Address", AddressSchema);
