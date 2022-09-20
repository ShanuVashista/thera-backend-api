import Joi from "joi";

export const waitListQuerySchema = Joi.object({
  doctorId: Joi.string(),
  dateOfAppointment: Joi.date(),
  appointmentId: Joi.string(),
});
