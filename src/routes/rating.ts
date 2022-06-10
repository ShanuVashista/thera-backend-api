import express from "express";
import controller from "../controllers/rating/rating.controller";
import auth from '../middlewares/auth.middleware';
const router = express.Router();

router.post("/doctor",auth, controller.Doctor_POST);
router.post('/application',auth, controller.Application_POST);
router.post('/list',auth, controller.List_POST);

export = router;
