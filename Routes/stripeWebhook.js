import express from "express";
import stripe from "../config/stripe.js";
import dotenv from "dotenv";
import PaymentLog from "../models/PaymentLog.js";

dotenv.config();
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(" Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentData = {
          orderId: session.metadata?.orderId || null,
          paymentReference: session.id,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: session.payment_status,
          paymentMethod: session.payment_method_types?.[0] || "unknown",
          paymentIntentId: session.payment_intent,
          customerEmail: session.customer_details?.email || null,
        };

        try {
          await PaymentLog.create(paymentData);
          console.log(" Payment data saved (Production)");
        } catch (error) {
          console.error(" Error saving to DB:", error.message);
        }
        break;
      }
      default:
        console.log(` Unhandled event type: ${event.type}`);
    }

    res.status(200).send("Received");
  }
);

export default router;
