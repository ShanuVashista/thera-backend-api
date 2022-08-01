import express from "express";
import { getMessages, addMessage } from "../controllers/Chat/chat.controller";

const router = express.Router();

router.get("/chating/:appoinmentId", getMessages);
router.post("/chating", addMessage);

export = router;
