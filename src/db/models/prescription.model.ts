import { Schema, model } from "mongoose";

const PrescriptionSchema: Schema = new Schema(
    {
        patient: { type: Schema.Types.ObjectId, required: true },
        doctor: { type: Schema.Types.ObjectId, required: true },
        appointment: { type: Schema.Types.ObjectId, required: true},
        prescription: { type: Array, required: true },
        status: { default: "Active", type: String, required: true },
        sent_to_patient: { type: Boolean, default: false, },
        sent_to_pharmacy: { type: Boolean, default: false, },
    },
    {
        timestamps: true, toJSON: {
            virtuals: true
        }
    }
);
PrescriptionSchema.virtual('doctor_details', {
    ref: 'user',
    localField: 'doctor',
    foreignField: '_id',
    justOne: true
});
PrescriptionSchema.virtual('patient_details', {
    ref: 'user',
    localField: 'patient',
    foreignField: '_id',
    justOne: true
});
PrescriptionSchema.virtual('appointment_details', {
    ref: 'Appointment',
    localField: 'appointment',
    foreignField: '_id',
    justOne: true
});
const Prescription = model(
    "Prescription",
    PrescriptionSchema
);

export default Prescription;
