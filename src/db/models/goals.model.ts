import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { ITask } from "./task.model";

export interface IGoal {
  _id: string;
  title: string;
  isdeleted: boolean;
  doctorId: PopulatedDoc<IUser>;
  task: PopulatedDoc<ITask>;
  patients: Array<string>;
}

const goalSchema = new mongoose.Schema<IGoal>({
  title: {
    type: String,
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  task: [
    {
      type: Schema.Types.ObjectId,
      ref: "task",
      default: null,
    },
  ],
  patients: [
    {
      type: String,
      default: null,
    },
  ],
  isdeleted: {
    type: Boolean,
    default: false,
  },
});

goalSchema.virtual("task_details", {
  ref: "task",
  localField: "patients",
  foreignField: "_id",
  justOne: true,
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
