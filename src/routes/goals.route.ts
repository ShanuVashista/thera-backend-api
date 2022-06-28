import express from "express";
import controller from "../controllers/goals/goals.controller";
import auth from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/create-goal", auth, controller.CreateGoal);
router.post("/get-goals", auth, controller.GetGoals);
router.get("/get-goal/:goalId", auth, controller.GetGoalById);
router.put("/assign-goal/:goalId", auth, controller.AssignGoalToPatient);
router.put("/edit-goal/:goalId", auth, controller.EditGoal);
router.put("/delete-goal/:goalId", auth, controller.DeleteGoal);

export = router;
