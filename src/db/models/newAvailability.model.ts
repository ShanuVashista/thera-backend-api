import mongoose from "mongoose";
import User, { IUser } from "./user";

export interface IAvailability {
  doctorId: mongoose.PopulatedDoc<IUser>;
  timeslots: Array<any>;
}

const availabilitySchema = new mongoose.Schema<IAvailability>({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  timeslots: [
    {
      start: Date,
      end: Date,
      active: Boolean,
      isBreak: Boolean,
    },
  ],
});

const NewAvailability = mongoose.model<IAvailability>(
  "newAvailability",
  availabilitySchema
);

export default NewAvailability;
