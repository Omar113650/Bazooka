import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import passport from "./config/passport.js";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { notfound, errorHandler } from "./middleware/error.js";

dotenv.config({ path: ".env" });

import paymentRoutes from "./Routes/index.js";
import webhookRoute from "./Routes/stripeWebhook.js";

connectDB();

const app = express();

// 🔐 security + sessions
app.use(session({ secret: "SECRET", resave: false, saveUninitialized: true }));
app.use(helmet());
app.use(hpp());
app.use(cors());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", webhookRoute);

app.use(express.json());

// 🛡 passport
app.use(passport.initialize());
app.use(passport.session());

// ===================== Routes =====================
import authRoutes from "./Routes/AuthRoutes.js";
import product from "./Routes/ProductsRoutes.js";
import categoryRoutes from "./Routes/CategoryRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";

app.use("/api/payment", paymentRoutes);

import addressRoutes from "./Routes/AddressRoutes.js";
import offerRoutes from "./Routes/OfferRoutes.js";
import cartRoutes from "./Routes/CartRoutes.js";

// test route
// app.get("/", (req, res) => res.send("Hello World from Root Route"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", product);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/offer", offerRoutes);
app.use("/api/v1/cart", cartRoutes);

// error handling
app.use(notfound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
