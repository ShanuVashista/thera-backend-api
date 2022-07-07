import express from "express";
import controller from "../controllers/goals/newGoal.controller";
import auth from "../middlewares/auth.middleware";
const router = express.Router();

router.put("/create-new-goal", auth, controller.CreateGoal);
router.put("/edit-goal/:goalId", auth, controller.EditGoal);
router.put("/assign-task-video/:taskId", auth, controller.AssignVideoToTask);
router.put(
  "/goal-assign-patient/:goalId",
  auth,
  controller.AssignGoalToPatient
);
router.put(
  "/task-assign-patient/:videoId",
  auth,
  controller.AssignTaskToPatient
);
router.put(
  "/goal-remove-patient/:goalId",
  auth,
  controller.RemovePatientFromAssignGoal
);
router.post("/get-goals", auth, controller.GetGoalList);
router.get("/get-goal/:goalId", auth, controller.GetGoalsById);
router.get("/get-task/:taskId", auth, controller.GetTaskById);
router.get("/get-task-bygoalid/:goalId", auth, controller.GetTaskByGoalId);
router.put("/delete-goal/:goalId", auth, controller.deleteGoal);
router.put("/delete-task/:taskId", auth, controller.deleteTask);
router.put("/delete-video/:videoId", auth, controller.deleteVideo);
router.put("/watch-completed/:taskId", auth, controller.taskVideoWatch);

export = router;
