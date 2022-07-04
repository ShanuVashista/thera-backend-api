import mongoose from "mongoose";
import User, { IUser } from "./user";

export interface IAvailability {
  doctorId: mongoose.PopulatedDoc<IUser>;
  start: Date;
  end: Date;
  break_start?: Date;
  break_end?: Date;
}

const availabilitySchema = new mongoose.Schema<IAvailability>({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  break_start: {
    type: Date,
  },
  break_end: {
    type: Date,
  },
});

const Availability = mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema
);
export default Availability;
