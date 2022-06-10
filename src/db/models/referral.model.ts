import { Schema, model} from "mongoose";

const referralSchema: Schema = new Schema(
  {
    doctorId : { type: Schema.Types.ObjectId, required: true },
    reasonForConsult: { type: String, required: true },
    hpi: { type: String, required: true },
    doctorsEmail :{ type: String, required: true },
    patientId :{ type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true, toJSON: {
        virtuals: true
    }
}
);
referralSchema.virtual('doctor_details', {
  ref: 'user',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});
referralSchema.virtual('patient_details', {
  ref: 'user',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});
const referral = model(
  "referral",
  referralSchema
);

export default referral;
