import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import "../config/passport.js";
import logger from "../utils/logger.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { FirstName, Phone, password, confirmPassword, role } = req.body;

  if (!FirstName || !Phone || !password || !confirmPassword) {
    logger.warn("Attempt to register with missing fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    logger.warn(`Password mismatch for phone: ${Phone}`);
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ Phone });
  if (existingUser) {
    logger.warn(`Attempt to register with existing phone: ${Phone}`);
    return res.status(403).json({ message: "Phone number already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    FirstName,
    Phone,
    password: hashedPassword,
    certainPassword: hashedPassword,
    role,
  });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  logger.info(`New user registered: ${Phone}`);

  res.status(201).json({
    message: "Registration successful. Verification code sent to your phone.",
    user,
    userId: user._id,
    token,
  });
});

// Login
export const loginUser = asyncHandler(async (req, res) => {
  const { Phone, password, role } = req.body;

  const user = await User.findOne({ Phone });
  if (!user)
    return res
      .status(400)
      .json({ message: "Invalid phone number or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid phone number or password" });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      FirstName: user.FirstName,
      Phone: user.Phone,
      role,
      isAdmin: user.isAdmin,
    },
    token,
  });
});

// Logout
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

// Update phone
export const UpdatePhone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Phone } = req.body;

  if (!Phone) {
    logger.warn(`Failed to update phone - no phone provided - user: ${id}`);
    return res.status(400).json({ message: "Phone number is required" });
  }

  const existingUser = await User.findOne({ Phone });

  if (existingUser && existingUser._id.toString() !== id) {
    logger.warn(`Phone number already in use: ${Phone} - user: ${id}`);
    return res.status(403).json({ message: "Phone number already in use" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { Phone } },
    { new: true }
  );

  if (!updatedUser) {
    logger.error(`Failed to update phone - user not found: ${id}`);
    return res.status(404).json({ message: "User not found" });
  }

  logger.info(`Phone number updated for user ${id} to ${Phone}`);

  res.status(200).json({
    message: "Phone number updated successfully",
    user: updatedUser,
  });
});

// Update profile
export const UpdateProfile = asyncHandler(async (req, res) => {
  const { FirstName, Phone, email, LastName } = req.body;
  const { id } = req.params;

  if (!FirstName || !Phone || !email || !LastName) {
    logger.warn(`Profile update failed - missing data for user: ${id}`);
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id);
  if (!user) {
    logger.error(`Profile update failed - user not found: ${id}`);
    return res.status(404).json({ message: "User not found" });
  }

  const existingUser = await User.findOne({ Phone });
  if (existingUser && existingUser._id.toString() !== id) {
    logger.warn(`Phone number ${Phone} already in use - user: ${id}`);
    return res.status(403).json({ message: "Phone number already in use" });
  }

  user.FirstName = FirstName;
  user.Phone = Phone;
  user.email = email;
  user.LastName = LastName;
  await user.save();

  logger.info(`Profile updated successfully for user ${id}`);

  res.status(200).json({
    message: "Profile updated successfully",
    user,
  });
});

// Change password
export const ChangePassword = asyncHandler(async (req, res) => {
  const { userId, password, NewPassword, confirmPassword } = req.body;

  if (!userId || !password || !NewPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (NewPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(NewPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: "Password changed successfully",
  });
});

// Google callback
export const googleCallbackController = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Login failed" });
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
};
