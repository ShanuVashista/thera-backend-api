import Joi from "joi";
import mongoose from "mongoose";

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  sort: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .default(["createdAt"]),
}).options({
  allowUnknown: true,
});

export const objectId = Joi.string().custom((value, helpers) => {
  if (mongoose.isValidObjectId(value)) {
    return value;
  }

  return helpers.message({ custom: "{{#label}} is not a valid objectId" });
});

export const pathParamIdSchema = Joi.object({
  id: objectId.required(),
});
