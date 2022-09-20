import express from "express";
import controller from "../controllers/referral/referral.controller";
import auth from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/addReferral", auth, controller.addReferral);

export = router;

// no need to pass userID
