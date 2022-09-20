import Joi from "joi";
import { paginationQuerySchema } from "./util";

export const healthProfileQuerySchema = paginationQuerySchema.keys({
  f: Joi.object()
    .keys({
      name: Joi.string(),
      relation: Joi.string(),
      weight: Joi.number(),
      height: Joi.number(),
      bmi: Joi.number(),
      medicalCondition: Joi.string(),
      pastMedicalCondition: Joi.string(),
      alergies: Joi.string(),
      medication: Joi.string(),
      smoking: Joi.boolean(),
      alcohol: Joi.boolean(),
      marijuana: Joi.boolean(),
    })
    .default({})
    .options({
      abortEarly: false,
      allowUnknown: false,
    }),
});
