/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";
import { IUser } from "./user";

export interface IPatientProfile {
  patientId: mongoose.PopulatedDoc<IUser>;
  profile_image?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  medicalCondition?: string;
  pastMedicalCondition?: string;
  pulse?: string;
  bloodPressure?: string;
  smoking?: boolean;
  alcohol?: boolean;
  marijuana?: boolean;
}

const patientProfileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    profile_image: { type: String },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    medicalCondition: { type: String },
    pastMedicalCondition: { type: String },
    pulse: { type: String },
    bloodPressure: { type: String },
    smoking: { type: Boolean },
    alcohol: { type: Boolean },
    marijuana: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

patientProfileSchema.virtual("patientDetails", {
  ref: "User",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);
export default PatientProfile;
