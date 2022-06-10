import express from "express";
import controller from "../controllers/clinicalNote/clinicalNote.controller";
import auth from '../middlewares/auth.middleware';
const router = express.Router();


router.post("/addClinicalNote",auth, controller.addClinicalNote);

export = router;

// no need to pass userID
