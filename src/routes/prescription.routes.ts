import express from "express";
import controller from "../controllers/prescription/prescription.controller";
import { validateParams } from "../middlewares/joi.middleware";
import auth from "../middlewares/auth.middleware";
import userRole from "../middlewares/userRole.middleware";
import { Roles } from "../lib/roles";
import { pathParamIdSchema } from "../validator/util";

const Router = express.Router();

Router.post(
  "/create",
  auth,
  userRole(Roles.DOCTOR),
  controller.Prescription_POST
);

Router.put(
  "/update/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.Prescription_PUT
);

Router.put(
  "/renewal/:id",
  auth,
  userRole(Roles.PATIENT),
  validateParams(pathParamIdSchema),
  controller.Prescription_Renewal_PUT
);

Router.post("/list", auth, controller.Prescription_List_POST);

Router.get(
  "/get/:id",
  auth,
  validateParams(pathParamIdSchema),
  controller.getPrescription
);

Router.delete(
  "/delete/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.deletePrescription
);

export default Router;
