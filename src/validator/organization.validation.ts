import Joi from "joi";
import {
  OrganizationStatuses,
  OrganizationTypes,
} from "../lib/organizationEnum";

const nameSchema = Joi.string();
const typeSchema = Joi.string().valid(...Object.values(OrganizationTypes));
const locationSchema = Joi.object({
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
});
const contactPersonSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email(),
  phone: Joi.string(),
}).or("email", "phone");
const statusSchema = Joi.string().valid(...Object.values(OrganizationStatuses));

export const createOrganizationSchema = Joi.object({
  name: nameSchema.required(),
  type: typeSchema.required(),
  location: locationSchema.required(),
  contact_person: contactPersonSchema,
}).required();

export const updateOrganizationSchema = Joi.object({
  name: nameSchema,
  type: typeSchema,
  location: locationSchema,
  contact_person: contactPersonSchema,
  status: statusSchema,
}).required();
