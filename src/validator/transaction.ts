import Joi from "joi";
import { objectId } from "./util";

export const createTransactionSchema = Joi.object()
  .options({
    abortEarly: false,
    allowUnknown: false,
  })
  .keys({
    patientId: objectId.required(),
    doctorId: Joi.string().required(),
    amount: Joi.number().required(),
    transactionId: Joi.string().required(),
    status: Joi.string().required(),
    dateTime: Joi.string().required(),
  });
