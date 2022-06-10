import { body } from "express-validator";

export const SymtomValue = [
  body("symtom_name")
    .not()
    .isEmpty()
    .withMessage("Symtom name should not be empty"),
];
