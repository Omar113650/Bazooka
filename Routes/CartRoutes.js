import express from "express";
import { GetCartSummary } from "../Controllers/CartControllers.js";

const router = express.Router();

router.get("/get-all-in-cart", GetCartSummary);

export default router;
