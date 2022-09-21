/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";
import { IUser } from "./user";
import { IPatientProfile } from "./patientProfile.model";
import { IAppointment } from "./appointment.model";

export interface IDiagnosis {
  doctorId: mongoose.PopulatedDoc<IUser>;
  patientId: mongoose.PopulatedDoc<IUser>;
  patientProfileId: mongoose.PopulatedDoc<IPatientProfile>;
  appointment: mongoose.PopulatedDoc<IAppointment>;
  time?: Date;
  description?: string;
  temprature?: string;
  systolicbp?: number;
  diastolicbp?: number;
  advice?: string;
}

const diagnosisSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PatientProfile",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Appointment",
    },
    time: { type: Date },
    description: { type: String },
    temprature: { type: String },
    systolicbp: { type: Number },
    diastolicbp: { type: Number },
    advice: { type: String },
  },
  {
    timestamps: true,
  }
);

diagnosisSchema.virtual("patientProfileDetails", {
  ref: "PatientProfile",
  localField: "patientProfileId",
  foreignField: "_id",
  justOne: true,
});

diagnosisSchema.virtual("doctorDetails", {
  ref: "User",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

diagnosisSchema.virtual("patientDetails", {
  ref: "User",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

diagnosisSchema.virtual("appointmentDetails", {
  ref: "Appointment",
  localField: "appointmentId",
  foreignField: "_id",
  justOne: true,
});

const Diagnosis = mongoose.model("diagnosis", diagnosisSchema);
export default Diagnosis;
