import express from "express";
import auth from "../middlewares/auth.middleware";
import postCall from "../controllers/call/call.controller";
const router = express.Router();
router.post("/token", auth, postCall);
export default router;
