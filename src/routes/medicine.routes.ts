import express from "express";
import controller from "../controllers/medicine/medicine.controller";
import { validateParams } from "../middlewares/joi.middleware";
import auth from "../middlewares/auth.middleware";
import userRole from "../middlewares/userRole.middleware";
import { Roles } from "../lib/roles";
import { pathParamIdSchema } from "../validator/util";

const Router = express.Router();

Router.post("/create", auth, userRole(Roles.DOCTOR), controller.createMedicine);

Router.put(
  "/update/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.updateMedicine
);

Router.post("/list", auth, controller.listMedicine);

Router.get(
  "/get/:id",
  auth,
  validateParams(pathParamIdSchema),
  controller.getMedicine
);

Router.delete(
  "/delete/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.deleteMedicine
);

export default Router;
