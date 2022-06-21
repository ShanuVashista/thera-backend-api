import { StatusCodes } from "http-status-codes";
import { Schema } from "joi";

export const validateBody = (schema: Schema) => {
  return validate(schema, "body");
};

export const validateQuery = (schema: Schema) => {
  return validate(schema, "query");
};

export const validateParams = (schema: Schema) => {
  return validate(schema, "params");
};

export const validate = (schema: Schema, key) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req[key]);
      const valid = error == null;

      if (valid) {
        next();
      } else {
        const { details } = error;
        const message = details.map((i) => i.message).join(",");

        console.log("error", message);
        res.status(StatusCodes.BAD_REQUEST).json({
          type: "error",
          status: false,
          message: message,
        });
      }
    } catch (error) {
      console.log("error", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        type: "error",
        status: false,
        message: error.message,
      });
    }
  };
};
