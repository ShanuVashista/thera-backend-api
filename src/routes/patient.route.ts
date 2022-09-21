import express from "express";
import register from "../controllers/patient/register.controller";
import healthData from "../controllers/patient/healthData.controller";
import {
  healthProfileSchema,
  healthDataSchema,
  healthProfileUpdateSchema,
} from "../validator/patient";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/joi.middleware";
import auth from "../middlewares/auth.middleware";
import {
  addHealthProfile,
  deleteHealthProfile,
  getHealthProfile,
  listHealthProfile,
  updateHealthProfile,
} from "../controllers/patient/healthProfile";
import patientProfileController from "../controllers/patientProfile/patientProfile.controller";
import { Roles } from "../lib/roles";
import userRole from "../middlewares/userRole.middleware";
import Prescription_Renewal_PUT from "../controllers/patient/prescription";
import { healthProfileQuerySchema } from "../validator/healthProfile";
import { pathParamIdSchema } from "../validator/util";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });
import { findMd } from "../controllers/doctor/findMd.controller";
import profileUpdate from "../controllers/patient/profileUpdate";
import { findMdSchema } from "../validator/findMd.validation";
import { getFaq } from "../controllers/faq/faq.controller";

const patientRouter = express.Router();

patientRouter.post("/register", upload.any(), register);

patientRouter.put(
  "/healthData",
  auth,
  userRole(Roles.PATIENT),
  validateBody(healthDataSchema),
  healthData
);

// Patient Profile Routes Start here

patientRouter.post(
  "/patient-profile",
  auth,
  userRole(Roles.PATIENT),
  upload.any(),
  patientProfileController.createPatientProfile
);

patientRouter.delete(
  "/patient-profile-delete/:id",
  auth,
  userRole(Roles.PATIENT),
  validateParams(pathParamIdSchema),
  patientProfileController.deletePatientProfile
);

patientRouter.get(
  "/patient-profile/:id",
  auth,
  userRole(Roles.PATIENT),
  validateParams(pathParamIdSchema),
  patientProfileController.getPatientProfile
);

patientRouter.put(
  "/patient-profile/:id",
  auth,
  userRole(Roles.PATIENT),
  upload.any(),
  validateParams(pathParamIdSchema),
  patientProfileController.updatePatientProfile
);

// Patient Profile Routes Ends here

patientRouter.post(
  "/healthProfiles",
  auth,
  userRole(Roles.PATIENT),
  upload.any(),
  validateBody(healthProfileSchema),
  addHealthProfile
);

patientRouter.put(
  "/healthProfiles/:id",
  auth,
  userRole(Roles.PATIENT),
  upload.any(),
  validateParams(pathParamIdSchema),
  validateBody(healthProfileUpdateSchema),
  updateHealthProfile
);

patientRouter.get(
  "/healthProfiles",
  auth,
  userRole(Roles.PATIENT),
  validateQuery(healthProfileQuerySchema),
  listHealthProfile
);

patientRouter.get(
  "/healthProfiles/:id",
  auth,
  userRole(Roles.PATIENT),
  validateParams(pathParamIdSchema),
  getHealthProfile
);

patientRouter.delete(
  "/healthProfiles/:id",
  auth,
  userRole(Roles.PATIENT),
  validateParams(pathParamIdSchema),
  deleteHealthProfile
);
patientRouter.put("/prescription/update", auth, Prescription_Renewal_PUT);

patientRouter.get(
  "/findMd",
  auth,
  userRole(Roles.PATIENT),
  validateQuery(findMdSchema),
  findMd
);

patientRouter.put(
  "/profile/update",
  auth,
  userRole(Roles.PATIENT),
  profileUpdate
);

patientRouter.get("/get-faq", auth, validateQuery(findMdSchema), getFaq);
export default patientRouter;
