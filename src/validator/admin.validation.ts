import Joi from "joi";

export const adminUpdateSchema = Joi.object()
  .keys({
    firstname: Joi.string(),
    lastname: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(1024),
  })
  .options({ stripUnknown: true });
