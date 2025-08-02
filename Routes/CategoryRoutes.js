import express from "express";
import {
  CreateCategory,
  GetCategory,
  DeleteCategory,
  UpdateCategory,
  Count,
} from "../Controllers/CategoryControllers.js";
import {ValidatedID} from "../middleware/validateID.js"
import{VerifyTokenAdmin} from "../middleware/VerifyToken.js"

const router = express.Router();

router.get("/count/total", Count);

router.post("/add-category",VerifyTokenAdmin, CreateCategory);
router.get("/get-category",VerifyTokenAdmin, GetCategory);
router.put("/update-category/:categoryId",VerifyTokenAdmin ,ValidatedID,UpdateCategory);
router.delete("/delete-category/:categoryId", VerifyTokenAdmin,ValidatedID,DeleteCategory);



export default router;
