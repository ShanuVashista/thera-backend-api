import Joi from "joi";
import { objectId, paginationQuerySchema } from "./util";

export const availabilitySchema = Joi.object({
  start: Joi.string().isoDate().required(),
  end: Joi.string().isoDate().required(),
  break_start: Joi.string().isoDate(),
  break_end: Joi.string().isoDate(),
})
  .and("break_start", "break_end")
  .custom((value) => {
    if (value.start > value.end) {
      throw new Error("Start time should be less then end time");
    }

    if (!(value.break_start && value.break_end)) return true;

    if (value.break_start > value.break_end) {
      throw new Error("Break start must be before break end");
    }

    if (value.break_start < value.start || value.break_end > value.end) {
      throw new Error("Break start and end must be within the time range");
    }

    return true;
  });

export const addAvailabilitySchema = Joi.array()
  .items(availabilitySchema)
  .max(2)
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export const updateAvailabilitySchema = Joi.array()
  .items(
    availabilitySchema.keys({
      _id: objectId,
    })
  )
  .max(2)
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

export const listAvailabilitySchema = paginationQuerySchema.keys({
  upcoming: Joi.number().integer().min(0).max(1).default(0),
  f: Joi.object()
    .keys({
      start: Joi.string().isoDate(),
      end: Joi.string().isoDate(),
      break_start: Joi.string().isoDate(),
      break_end: Joi.string().isoDate(),
    })
    .default({})
    .options({
      abortEarly: false,
      allowUnknown: false,
    }),
});
