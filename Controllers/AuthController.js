import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import "../config/passport.js";
import logger from "../utils/logger.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { FirstName, Phone, password, confirmPassword, role } = req.body;

  if (!FirstName || !Phone || !password || !confirmPassword) {
    logger.warn("محاولة تسجيل بحقول ناقصة");
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  if (password !== confirmPassword) {
    logger.warn(`كلمتا المرور غير متطابقتين لرقم الهاتف: ${Phone}`);
    return res.status(400).json({ message: "كلمتا المرور غير متطابقتين" });
  }

  const existingUser = await User.findOne({ Phone });
  if (existingUser) {
    logger.warn(`محاولة تسجيل برقم مستخدم مسبقًا: ${Phone}`);
    return res.status(403).json({ message: "رقم الهاتف مستخدم بالفعل" });
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

  logger.info(`تم تسجيل مستخدم جديد: ${Phone}`);

  res.status(201).json({
    message: "تم التسجيل بنجاح. تم إرسال كود التحقق لهاتفك.",
    user,
    userId: user._id,
    token,
  });
});
//  تسجيل الدخول
export const loginUser = asyncHandler(async (req, res) => {
  const { Phone, password, role } = req.body;

  const user = await User.findOne({ Phone });
  if (!user)
    return res
      .status(400)
      .json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    message: "تم تسجيل الدخول بنجاح",
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
// تسجيل الخروج
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
});
//  تحديث رقم الهاتف
export const UpdatePhone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Phone } = req.body;

  if (!Phone) {
    logger.warn(
      `فشل تحديث رقم الهاتف - لم يتم إرسال رقم هاتف - المستخدم: ${id}`
    );
    return res.status(400).json({ message: "رقم الهاتف مطلوب" });
  }

  // تحقق هل الرقم الجديد مستخدم من قبل مستخدم آخر
  const existingUser = await User.findOne({ Phone });

  if (existingUser && existingUser._id.toString() !== id) {
    logger.warn(
      `محاولة استخدام رقم هاتف موجود مسبقًا: ${Phone} - المستخدم: ${id}`
    );
    return res.status(403).json({ message: "رقم الهاتف مستخدم بالفعل" });
  }

  // تحديث رقم الهاتف
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { Phone } },
    { new: true }
  );

  if (!updatedUser) {
    logger.error(`فشل تحديث الهاتف - المستخدم غير موجود: ${id}`);
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  logger.info(`تم تحديث رقم الهاتف للمستخدم ${id} إلى ${Phone}`);

  res.status(200).json({
    message: "تم تحديث رقم الهاتف بنجاح",
    user: updatedUser,
  });
});

export const UpdateProfile = asyncHandler(async (req, res) => {
  const { FirstName, Phone, email, LastName } = req.body;
  const { id } = req.params;

  // التحقق من الحقول المطلوبة
  if (!FirstName || !Phone || !email || !LastName) {
    logger.warn(`تحديث فاشل - بيانات ناقصة للمستخدم: ${id}`);
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  // التحقق من وجود المستخدم
  const user = await User.findById(id);
  if (!user) {
    logger.error(`محاولة تحديث لمستخدم غير موجود - ID: ${id}`);
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  // التحقق من أن رقم الهاتف غير مستخدم من مستخدم آخر
  const existingUser = await User.findOne({ Phone });
  if (existingUser && existingUser._id.toString() !== id) {
    logger.warn(`رقم الهاتف ${Phone} مستخدم مسبقًا من مستخدم آخر - ID: ${id}`);
    return res.status(403).json({ message: "رقم الهاتف مستخدم بالفعل" });
  }

  // تحديث البيانات
  user.FirstName = FirstName;
  user.Phone = Phone;
  user.email = email;
  user.LastName = LastName;
  await user.save();

  logger.info(`تم تحديث بيانات المستخدم ${id} بنجاح`);

  res.status(200).json({
    message: "تم تحديث البيانات بنجاح",
    user,
  });
});
// تغيير كلمة المرور
export const ChangePassword = asyncHandler(async (req, res) => {
  const { userId, password, NewPassword, confirmPassword } = req.body;

  if (!userId || !password || !NewPassword || !confirmPassword) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  if (NewPassword !== confirmPassword) {
    return res.status(400).json({ message: "كلمتا المرور غير متطابقتين" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
  }

  const hashedPassword = await bcrypt.hash(NewPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: "تم تغيير كلمة المرور بنجاح",
  });
});
//  Google Callback
export const googleCallbackController = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "فشل تسجيل الدخول" });
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
};
