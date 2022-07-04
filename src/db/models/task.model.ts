import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";

export interface ITask {
  name: string;
  videoId: Array<string>;
  patients: Array<string>;
  isCompleted: boolean;
  isdeleted: boolean;
  uploaderId: PopulatedDoc<IUser>;
}

const TaskSchema = new mongoose.Schema<ITask>({
  name: {
    type: String,
    required: true,
  },
  videoId: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  ],
  patients: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  isdeleted: {
    type: Boolean,
    default: false,
  },
});

const task = model("task", TaskSchema);

export default task;
