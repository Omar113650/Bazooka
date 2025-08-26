import Joi from "joi";
import mongoose from "mongoose";
import passwordComplexity from "joi-password-complexity"; 

const UserSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      // required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    LastName: {
      type: String,
      // required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    Phone: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    // email: {
      type: String,
    //   // required: true,
    //   // unique: true,
    //   lowercase: true,
    //   // trim: true,
    //   // minlength: 5,
    //   // maxlength: 100,
    // },

    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
    },

    NewPassword: {
      type: String,

      minlength: 8,
    },

    confirmPassword: {
      type: String,

      minlength: 8,
    },

    role: {
      type: String,
      enum: ["admin", "user", "customer"],
      required:true,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },



  },
{ timestamps: true }



);

export const User = mongoose.model("User", UserSchema);


UserSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.isAdmin = true;
  } else {
    this.isAdmin = false;
  }
  next();
});
