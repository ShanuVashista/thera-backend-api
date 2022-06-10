import { Schema, model} from "mongoose";

const clinicalNoteSchema: Schema = new Schema(
  {
    doctorId : { type: Schema.Types.ObjectId, required: true },
    subjective: { type: String, required: true },
    objective: { type: String, required: true },
    assessment: { type: String, required: true },
    plan: { type: String, required: true },
    patientId :{ type: Schema.Types.ObjectId, required: true },
    eventOutcome :{ type: String, required: true },
  },
  {
    timestamps: true, toJSON: {
        virtuals: true
    }
  }
);
clinicalNoteSchema.virtual('doctor_details', {
  ref: 'user',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});
clinicalNoteSchema.virtual('patient_details', {
  ref: 'user',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});
const clinicalNote = model(
  "clinicalNote",
  clinicalNoteSchema
);

export default clinicalNote;
