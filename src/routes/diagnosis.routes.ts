import express from "express";
import controller from "../controllers/diagnosis/diagnosis.controller";
import { validateParams } from "../middlewares/joi.middleware";
import auth from "../middlewares/auth.middleware";
import userRole from "../middlewares/userRole.middleware";
import { Roles } from "../lib/roles";
import { pathParamIdSchema } from "../validator/util";

const diagnosisRoute = express.Router();

diagnosisRoute.post(
  "/dignosis",
  auth,
  userRole(Roles.DOCTOR),
  controller.createDiagnosis
);

diagnosisRoute.put(
  "/dignosis/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.updateDiagnosis
);

diagnosisRoute.post("/dignosis-list", auth, controller.listDiagnosis);

diagnosisRoute.post(
  "/dignosis-list-by-patient",
  auth,
  userRole(Roles.DOCTOR),
  controller.listDiagnosisByPatientId
);

diagnosisRoute.get(
  "/dignosis/:id",
  auth,
  validateParams(pathParamIdSchema),
  controller.getDiagnosis
);

diagnosisRoute.delete(
  "/dignosis/:id",
  auth,
  userRole(Roles.DOCTOR),
  validateParams(pathParamIdSchema),
  controller.deleteDiagnosis
);

export default diagnosisRoute;
