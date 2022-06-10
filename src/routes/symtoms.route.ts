import express from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/joi.middleware";
import auth from "../middlewares/auth.middleware";
import { Roles } from "../lib/roles";
import userRole from "../middlewares/userRole.middleware";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });
import {
  createSymtomps,
  getSymtoms,
  createDoctorSymtom,
  getDoctorListBySymtom,
} from "../controllers/symtoms/symtomList";

const symtomRouter = express.Router();

symtomRouter.post("/create", auth, userRole(Roles.DOCTOR), createSymtomps);
symtomRouter.post(
  "/doctor-symtom/create",
  auth,
  userRole(Roles.DOCTOR),
  createDoctorSymtom
);
symtomRouter.post("/symtomlist", auth, getSymtoms);
symtomRouter.post("/doctorlist", auth, getDoctorListBySymtom);

export default symtomRouter;
