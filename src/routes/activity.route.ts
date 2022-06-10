import express from 'express';
import auth from '../middlewares/auth.middleware';
import Activity from '../controllers/activity/activity.controller';
const router = express.Router()
router.post("/list",auth,Activity.List_POST);
export default router
