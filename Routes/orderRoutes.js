import express from "express";
import {
  placeOrder,
  confirmOrder,
  AddNewAddress,
  CreateCoupon,
  EnterCoupon,
} from "../Controllers/OrderController.js";

import { ValidatedID } from "../middleware/validateID.js";
import { VerifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post(
  "/create-order/:categoryId/:productId",
  VerifyToken,
  ValidatedID,
  placeOrder
);

router.post("/confirm-order", VerifyToken, confirmOrder);

router.post("/Add-New-Address", VerifyToken, AddNewAddress);

router.post("/create-coupon", VerifyToken, CreateCoupon);

router.post("/enter-coupon", VerifyToken, EnterCoupon);

export default router;
