import { Schema, model, PopulatedDoc } from "mongoose";
import { AppointmentStatuses } from "../../lib/appointmentStatuses";
import { IHealthProfile } from "./healthProfile.model";
import { IUser } from "./user";

export interface IAppointment {
  appointmentId: Schema.Types.ObjectId;
  userId: PopulatedDoc<IUser>;
  patientId: PopulatedDoc<IHealthProfile>;
  doctorId: PopulatedDoc<IUser>;
  appointmentType: string;
  dateOfAppointment: Date;
  status: string;
  isEmergency: boolean;
  symptoms: Array<string>;
  reason: string,
  Meta: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'healthProfile', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'user' },
    appointmentType: { type: String, required: true },
    dateOfAppointment: { type: Date, required: true },
    status: { default: AppointmentStatuses.PENDING, type: String, required: true },
    isEmergency: { default: false, type: Boolean, required: true },
    symptoms: [{ type: String, required: true, default: null }],
    Meta: { type: String },
    reason: { type: String }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

AppointmentSchema.virtual("patient_details", {
  ref: 'healthProfile',
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
})

AppointmentSchema.virtual("user_details", {
  ref: 'user',
  localField: "userId",
  foreignField: "_id",
  justOne: true,
})

AppointmentSchema.virtual("doctor_details", {
  ref: 'user',
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
})

const Appointment = model(
  "Appointment",
  AppointmentSchema
);

export default Appointment;
