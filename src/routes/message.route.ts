import express from "express";
import {
  getMessageByAppointmentId,
  sendMessage,
  updateMessageRecivedStatus,
  updateMessageSeenStatus,
  getAppointmentList,
} from "../controllers/message/message.controller";
import auth from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/send-message", auth, sendMessage);

router.put("/message-received/:messageId", auth, updateMessageRecivedStatus);

router.put("/message-seen/:messageId", auth, updateMessageSeenStatus);

router.get("/message/:appoinmentId", auth, getMessageByAppointmentId);

router.get("/apointment", auth, getAppointmentList);

export = router;
