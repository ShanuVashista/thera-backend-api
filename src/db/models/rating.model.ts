/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";

const rateSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    rating: { type: Number },
    type: { type: String, enum: ["doctor", "application"] },
    description: { type: String },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
rateSchema.virtual("doctor_details", {
  ref: "user",
  localField: "doctor",
  foreignField: "_id",
  justOne: true,
});
rateSchema.virtual("rater_details", {
  ref: "user",
  localField: "rater",
  foreignField: "_id",
  justOne: true,
});
const HealthProfile = mongoose.model("rating", rateSchema);
export default HealthProfile;
