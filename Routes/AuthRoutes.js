import express from "express";
import passport from "passport";
import "../config/passport.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  UpdateProfile,
  ChangePassword,
  UpdatePhone,
} from "../Controllers/AuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put("/profile/:id", UpdateProfile);
router.put("/change-password", ChangePassword);
router.put("/phone/:id", UpdatePhone);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
    session: false,
  }),
  (req, res) => {
    res.send("Login successful ");
  }
);

// http://localhost:8000/api/auth/google

export default router;
