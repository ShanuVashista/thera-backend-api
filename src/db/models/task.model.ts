import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IGoal } from "./goals.model";

export interface ITask {
  name: string;
  videoId: Array<string>;
  patients: Array<string>;
  iscompleted: boolean;
  isdeleted: boolean;
  goalId: PopulatedDoc<IGoal>;
  uploaderId: PopulatedDoc<IUser>;
}

const TaskSchema = new mongoose.Schema<ITask>({
  name: {
    type: String,
    required: true,
  },
  goalId: {
    type: Schema.Types.ObjectId,
    ref: "goal",
    default: null,
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
  iscompleted: {
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
