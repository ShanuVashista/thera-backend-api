import express from "express";
import controller from "../controllers/video/video.controller";
import auth from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/add-video", auth, controller.AddVideo);
router.post("/get-video", auth, controller.GetVideoList);
router.get("/get-video/:videoId", auth, controller.GetVideoById);
router.put("/assign-video/:videoId", auth, controller.AssignVideoToPatient);
router.put("/delete-video/:videoId", auth, controller.DeleteVideo);
router.put("/edit-video/:videoId", auth, controller.EditVideo);

export = router;
