import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";

export interface IGoal {
  title: string;
  goals: Array<unknown>;
  isdeleted: boolean;
  doctorId: PopulatedDoc<IUser>;
  patients: Array<string>;
}

const goalSchema = new mongoose.Schema<IGoal>({
  title: {
    type: String,
    required: true,
  },
  goals: {
    type: Array,
    default: null,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  patients: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  ],
  isdeleted: {
    type: Boolean,
    default: false,
  },
});

goalSchema.virtual("doctor", {
  ref: "user",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

goalSchema.virtual("patient", {
  ref: "user",
  localField: "patients",
  foreignField: "_id",
  justOne: true,
});

const goal = model("goal", goalSchema);

export default goal;
