// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     console.log(process.env.MONGO_URI)
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB connected');

//   } catch (err) {
//     console.error('❌ MongoDB connection failed:', err);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";
// import { User } from "../models/User.js";
const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected");

    // بعد الاتصال، نحاول نحذف الـ index
    // await User.collection.dropIndex("email_1");
    // console.log('🗑️ Index "email_1" dropped successfully');
  } catch (err) {
    console.error(" Error during DB setup:", err);
    process.exit(1);
  }
};

export default connectDB;
