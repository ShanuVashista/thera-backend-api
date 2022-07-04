/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";
import { IUser } from "./user";

export interface IHealthProfile {
  name: string;
  self: boolean;
  profile_image?: string;
  relation: string;
  userId?: mongoose.PopulatedDoc<IUser>;
  weight?: number;
  height?: number;
  bmi?: number;
  medicalCondition?: string;
  pastMedicalCondition?: string;
  alergies?: string;
  medication?: string;
  smoking?: boolean;
  alcohol?: boolean;
  marijuana?: boolean;
}

const healthProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 50 },
    profile_image: { type: String },
    self: { type: Boolean },
    relation: { type: String, required: true, minlength: 2, maxlength: 50 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    medicalCondition: { type: String },
    pastMedicalCondition: { type: String },
    alergies: { type: String },
    medication: { type: String },
    smoking: { type: Boolean },
    alcohol: { type: Boolean },
    marijuana: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

// healthProfileSchema.methods.toJSON = function (this: mongoose.HydratedDocument<IHealthProfile>) {
//     const healthProfile = this
//     const healthProfileObject = healthProfile.toObject()

//     if (healthProfileObject.profile_image) {
//         healthProfileObject.profile_image = `/uploads/${healthProfile.userId}/${healthProfile.profile_image}`
//     }

//     return healthProfileObject
// }

const HealthProfile = mongoose.model("healthProfile", healthProfileSchema);
export default HealthProfile;
