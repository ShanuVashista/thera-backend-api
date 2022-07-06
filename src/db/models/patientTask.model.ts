import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { ITask } from "./task.model";
import { IGoal } from "./goals.model";
import { IVideo } from "./video.model";

export interface IPatientTask {
  _id: string;
  taskId: PopulatedDoc<ITask>;
  goalId?: PopulatedDoc<IGoal>;
  videoId?: PopulatedDoc<IVideo>;
  patientId: PopulatedDoc<IUser>;
  iscompleted: boolean;
  taskVideos?: Array<unknown>;
  isdeleted: boolean;
}

const patientTaskSchema = new mongoose.Schema<IPatientTask>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  goalId: {
    type: Schema.Types.ObjectId,
    ref: "task",
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "task",
  },

  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "video",
  },
  iscompleted: {
    type: Boolean,
    default: false,
  },
  isdeleted: {
    type: Boolean,
    default: false,
  },
});

patientTaskSchema.virtual("task", {
  ref: "user",
  localField: "taskId",
  foreignField: "_id",
  justOne: true,
});

patientTaskSchema.virtual("patient", {
  ref: "user",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

const patient_task = model("patient_task", patientTaskSchema);

export default patient_task;
