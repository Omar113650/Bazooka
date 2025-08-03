import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Cart } from "../models/cart.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/order.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const { productId, categoryId } = req.params;
  const { selectedOptions, quantity = 1, CommentForPay, phone } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let totalPrice = product.basePrice;

  // جمع سعر الخيارات الإضافية
  selectedOptions.forEach((option) => {
    const level = product.options?.find((o) => o.level === option.level);
    if (level) {
      const choice = level.choices.find((c) => c.label === option.choice);
      if (choice) totalPrice += choice.additionalPrice;
    }
  });

  totalPrice *= quantity;

  // إنشاء العنصر في السلة
  const cartItem = await Cart.create({
    category: categoryId,
    product: productId,
    selectedOptions,
    quantity,
    totalPrice,
    CommentForPay,
    phone,
  });

  // إعداد الـ Summary
  const subtotal = totalPrice;
  const deliveryFee = 35;
  const grandTotal = subtotal + deliveryFee;
  const taxInfo = "السعر شامل الضريبة";
  const deliveryTime = "60 دقيقة";

  res.status(201).json({
    message: "Item added to cart",
    cartItem,
    summary: {
      subtotal: `${subtotal.toFixed(2)} جنيه`,
      taxInfo,
      deliveryFee: `${deliveryFee.toFixed(2)} جنيه`,
      deliveryTime,
      grandTotal: `${grandTotal.toFixed(2)} جنيه`,
    },
  });
});

export const confirmOrder = asyncHandler(async (req, res) => {
  const { phone, couponCode } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // اجلب عناصر السلة الخاصة بالرقم ده (أو user لو عامل تسجيل دخول)
  const cartItems = await Cart.find({ phone });

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // حساب إجمالي السعر
  let totalAmount = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  let coupon;
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    totalAmount = totalAmount - (totalAmount * coupon.discountPercent) / 100;
  }

  // إنشاء الطلب
  const order = await Order.create({
    items: cartItems.map((item) => ({
      product: item.product,
      selectedOptions: item.selectedOptions,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      comment: item.CommentForPay,
    })),
    totalAmount,
    phone,
    couponUsed: coupon?.code || null,
  });

  // حذف السلة لهذا الرقم
  await Cart.deleteMany({ phone });

  res.status(201).json({ message: "Order confirmed", order });
});

export const AddNewAddress = asyncHandler(async (req, res) => {
  const {
    city,
    region,
    street,
    phone_main,
    phone,
    numberOfHome,
    numberOfFloor,
    numberOfApartment,
    landmark,
  } = req.body;

  if (!city || !region || !street || !phone_main) {
    return res.status(400).json({ message: "يرجى إدخال جميع الحقول الأساسية" });
  }

  const CreateNewAddress = await Order.create({
    city,
    region,
    street,
    phone_main,
    phone,
    numberOfHome,
    numberOfFloor,
    numberOfApartment,
    landmark,
  });

  res.status(200).json({ message: "create successful", CreateNewAddress });
});

export const CreateCoupon = asyncHandler(async (req, res) => {
  const { code, expiresAt } = req.body;

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    return res.status(400).json({ message: "الكوبون موجود بالفعل" });
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountPercent: 10, // ثابت
    expiresAt,
  });

  res.status(201).json({ message: "تم إنشاء الكوبون", coupon });
});

export const EnterCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // تحقق من وجود الكود
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    return res.status(404).json({ message: "الكوبون غير موجود" });
  }

  // تحقق من تاريخ الانتهاء
  const now = new Date();
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return res.status(400).json({ message: "انتهت صلاحية الكوبون" });
  }

  // رجّع نسبة الخصم
  return res.status(200).json({
    message: "كوبون صالح ✅",
    discountPercent: coupon.discountPercent,
    expiresAt: coupon.expiresAt,
  });
});



















































