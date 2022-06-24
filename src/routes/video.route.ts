import express from "express";
import controller from "../controllers/video/video.controller";
import auth from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/add-video", auth, controller.AddVideo);
router.post("/get-video", auth, controller.GetVideoList);
router.put("/assign-video/:videoId", auth, controller.AssignVideoToPatient);

export = router;
