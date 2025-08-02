// utils/Cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  رفع صورة إلى Cloudinary
export const cloudinaryUploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

//  حذف صورة واحدة بـ publicId
export const cloudinaryRemoveImage = async (ImagePublic) => {
  try {
    const data = await cloudinary.uploader.destroy(ImagePublic);
    return data;
  } catch (error) {
    return error;
  }
};

// حذف صور متعددة
export const cloudinaryRemoveMultipleImage = async (PublicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(PublicIds);
    return result;
  } catch (error) {
    return error;
  }
};



