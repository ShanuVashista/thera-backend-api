import { body } from "express-validator";
import Joi from "joi";

export const RegisterVal = [
  body("email").isEmail().withMessage("Email not valid"),
  body("type").not().isEmpty().withMessage("User type should not be empty"),
  body("password")
    .isLength({ min: 4, max: 18 })
    .trim()
    .withMessage(
      "Password must have greater then 4 and less then 18 chars long"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

export const healthDataSchema = Joi.object()
  .options({
    abortEarly: false,
    allowUnknown: false,
  })
  .keys({
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
  });

export const healthProfileSchema = healthDataSchema.keys({
  name: Joi.string().required(),
  relation: Joi.string().required(),
});

export const healthProfileUpdateSchema = healthDataSchema.keys({
  name: Joi.string(),
  relation: Joi.string(),
});
