import express from "express";
import controller from "../controllers/appointment/appointment.controller";
import there_controller from "../controllers/appointment/thera-appointment";
import { waitList } from "../controllers/appointment/waitList.controller";
import { Roles } from "../lib/roles";
import auth from "../middlewares/auth.middleware";
import { validateQuery, validateBody } from "../middlewares/joi.middleware";
import userRole from "../middlewares/userRole.middleware";
import { createAppointmentSchema } from "../validator/appointment.validation";
import { waitListQuerySchema } from "../validator/waitList.validation";
const router = express.Router();

router.post(
  "/",
  auth,
  validateBody(createAppointmentSchema),
  controller.addAppointment
);
router.post(
  "/create/thera-appointment",
  auth,
  validateBody(createAppointmentSchema),
  there_controller.addAppointment
);
router.post("/list", auth, controller.getAppointments);
router.get("/count", auth, controller.Count_Appointment);
router.get("/count/thera", auth, controller.Count_Appointment_Thera);
router.get(
  "/waitlist",
  auth,
  userRole(Roles.PATIENT),
  validateQuery(waitListQuerySchema),
  waitList
);
router.get("/:Appointmentid", controller.getAppointment);
router.put("/:Appointmentid", controller.updateAppointment);
router.delete("/:Appointmentid", controller.deleteAppointment);
export = router;

// no need to pass userID
