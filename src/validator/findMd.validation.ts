import Joi from "joi";
import { paginationQuerySchema } from "./util";

export const findMdSchema = paginationQuerySchema.keys({
  f: Joi.object(),
  appointmentTime: Joi.string().isoDate(),
});
