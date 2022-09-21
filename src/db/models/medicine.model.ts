/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";

enum MedicineTypeEnum {
  TABLET = "tablet",
  SYRUP = "syrup",
  INJECTION = "injection",
  LOATION = "loation",
}

export interface IMedicine {
  name: string;
  inventory?: number;
  specification?: string;
  producer?: string;
  price?: number;
  defaultUsage?: string;
  medicineType?: MedicineTypeEnum;
}

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    inventory: { type: Number },
    specification: { type: String },
    producer: { type: String },
    price: { type: Number, required: true },
    defaultUsage: { type: String },
    medicineType: {
      type: String,
      enum: MedicineTypeEnum,
      default: MedicineTypeEnum.TABLET,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
