import express from "express";
import {
  AddAddress,
  DeleteAddress,
  UpdateAddress,
} from "../Controllers/AddressControllers.js";

import { ValidatedID } from "../middleware/validateID.js";
import { VerifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/add-address", VerifyToken, ValidatedID, AddAddress);

router.delete("/delete-address/:id", VerifyToken, ValidatedID, DeleteAddress);

router.put("/update-address/:id", VerifyToken, ValidatedID, UpdateAddress);

export default router;
