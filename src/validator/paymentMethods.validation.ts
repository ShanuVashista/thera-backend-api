import Joi from "joi";
import { PaymentMethodEnum } from "../lib/PaymentMethodEnum";

export const paymentMethod = Joi.object()
  .options({
    abortEarly: false,
    allowUnknown: true,
  })
  .keys({
    type: Joi.string()
      .valid(
        PaymentMethodEnum.CARD,
        PaymentMethodEnum.BANK,
        PaymentMethodEnum.HEALTH_CARD
      )
      .required(),
    card_number: Joi.string().when("type", {
      is: PaymentMethodEnum.CARD,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    card_name: Joi.string().when("type", {
      is: PaymentMethodEnum.CARD,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    card_expiry: Joi.string().when("type", {
      is: PaymentMethodEnum.CARD,
      then: Joi.string()
        .custom((value) => {
          const [month, year] = value.split("/");
          Joi.assert(
            parseInt(month),
            Joi.number().integer().min(1).max(12).required()
          );
          Joi.assert(
            parseInt(year),
            Joi.number().integer().min(1).max(99).required()
          );
          return value;
        })
        .required(),
      otherwise: Joi.forbidden(),
    }),
    card_cvv: Joi.string().when("type", {
      is: PaymentMethodEnum.CARD,
      then: Joi.string().length(3).required(),
      otherwise: Joi.forbidden(),
    }),
    bank_name: Joi.string().when("type", {
      is: PaymentMethodEnum.BANK,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    account_number: Joi.string().when("type", {
      is: PaymentMethodEnum.BANK,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    account_name: Joi.string().when("type", {
      is: PaymentMethodEnum.BANK,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    account_type: Joi.string().when("type", {
      is: PaymentMethodEnum.BANK,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    ifsc_code: Joi.string().when("type", {
      is: PaymentMethodEnum.BANK,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    // TODO: add validation for health card number format
    health_card_number: Joi.string().when("type", {
      is: "health_card",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
  });
