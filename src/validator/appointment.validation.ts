import Joi from "joi";
import { objectId } from "./util";

export const createAppointmentSchema = Joi.object({
  // patientId: objectId.required(),
  doctorId: objectId.required(),
  appointmentType: Joi.string().required(),
  dateOfAppointment: Joi.date().required(),
  isEmergency: Joi.boolean(),
  symptoms: Joi.array().items(Joi.string()),
  reason: Joi.string(),
}).options({
  allowUnknown: true,
  abortEarly: false,
});
