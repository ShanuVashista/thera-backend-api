import { Schema, model } from "mongoose";

const sickNoteSchema: Schema = new Schema(
  {
    roleId: { type: String },
    patientReportFrom: { type: String },
    patientReportTo: { type: String },
    patientBedrest: { type: String },
    patientReassessment: { type: String },
    physioTherapy: { type: Boolean },
    massageTherapy: { type: Boolean },
    chiropractorTherapy: { type: Boolean },
    others: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

const sickNote = model("sickNote", sickNoteSchema);
export default sickNote;
