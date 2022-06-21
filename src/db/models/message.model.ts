import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IAppointment } from "./appointment.model";

export interface IMessage {
  appointmentId: PopulatedDoc<IAppointment>;
  userId: PopulatedDoc<IUser>;
  message: string;
  received: boolean;
  seen: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    message: { type: String, required: true },
    received: { type: Boolean, default: false, required: true },
    seen: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const Message = model("Message", messageSchema);

export default Message;
