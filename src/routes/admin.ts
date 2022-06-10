import express from 'express';
var router = express.Router()
import auth from '../middlewares/auth.middleware';
import { Roles } from '../lib/roles';
import userRole from '../middlewares/userRole.middleware';
import { doctorApprove } from '../controllers/siteAdmin/doctorApprove.controller';


router.put(
    "/doctorApprove",
    auth,
    userRole(Roles.ADMIN),
    doctorApprove

);
export default router
