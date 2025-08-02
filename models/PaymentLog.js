import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
  {
    orderId: String,
    paymentReference: String,
    amount: Number,
    currency: String,
    status: String,
    paymentMethod: String,
  },
  { timestamps: true }
);

const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);
export default PaymentLog;
