import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";

export interface IVideo {
  isYoutube: boolean;
  isdeleted: boolean;
  title: string;
  url: string;
  uploaderId: PopulatedDoc<IUser>;
  patients: Array<string>;
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    isYoutube: {
      type: Boolean,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    isdeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    patients: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

videoSchema.virtual("uploader", {
  ref: "user",
  localField: "uploaderId",
  foreignField: "_id",
  justOne: true,
});

const video = model("video", videoSchema);

export default video;
