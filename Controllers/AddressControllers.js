import { Address } from "../models/Address.js";
import asyncHandler from "express-async-handler";

// @desc   Add Address
// @route  POST /api
export const AddAddress = asyncHandler(async (req, res) => {
  const { city, Region } = req.body;

  if (!city || !Region) {
    return res.status(401).json({ message: "enter city && Region" });
  }

  const CreateAddress = await Address.create({ city, Region });
  res
    .status(200)
    .json({ message: " create address successful ", CreateAddress });
});

// @desc   Delete Address
// @route  DELETE

export const DeleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const find_Address = await Address.findById(id);
  if (!find_Address) {
    return res.status(401).json({ message: " Not found Address" });
  }
  await Address.deleteOne({ _id: id });

  res.status(200).json({ message: " deleted address successful " });
});

// @desc   updated address
// @route  update

export const UpdateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { city, Region } = req.body;

  const find_Address = await Address.findById(id);
  if (!find_Address) {
    return res.status(401).json({ message: "Not found Address" });
  }

  const updated = await Address.findByIdAndUpdate(
    id,
    {
      $set: {
        city: city || find_Address.city,
        Region: Region || find_Address.Region,
      },
    },
    { new: true }
  );

  res.status(200).json({ message: "updated address successful", updated });
});
