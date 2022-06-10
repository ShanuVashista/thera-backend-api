import express from 'express';
import controller from '../controllers/user/corporate.controller';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });
const corporateRoute = express.Router();

corporateRoute.post('/patient',upload.any(),controller.addPatient);
corporateRoute.post('/doctor',upload.any(),controller.addPhysician);


export default corporateRoute;
