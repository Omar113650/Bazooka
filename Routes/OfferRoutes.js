import express from "express";
import {
  createOffers,
  getAllOffers,
  updateOffers,
  deleteProduct,
  GetTopOffers,
} from "../Controllers/OffersControllers.js";
import upload from "../utils/multer.js";
import { ValidatedID } from "../middleware/validateID.js";
import { VerifyToken, VerifyTokenAdmin } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/top-offers", VerifyToken, GetTopOffers);

router.get("/get-offers", VerifyToken, getAllOffers);

router.post(
  "/add-offers",
  VerifyTokenAdmin,
  upload.single("Image"),
  createOffers
);

router.put(
  "/update-offer/:id",
  VerifyTokenAdmin,
  ValidatedID,
  upload.single("Image"),
  updateOffers
);

router.delete(
  "/delete-offer/:id",
  VerifyTokenAdmin,
  ValidatedID,
  deleteProduct
);

export default router;
