// routes/planRoutes.ts
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
    createWorkoutPlan, getMyWorkoutPlans, getWorkoutPlanById,
    updateWorkoutPlan, deleteWorkoutPlan,
    createNutritionPlan, getMyNutritionPlans, getNutritionPlanById,
    updateNutritionPlan, deleteNutritionPlan,
    assignPlan, updateAssignmentStatus, getCoachMemberPlans,
    getMyActivePlans, getMyPlanHistory
} from "../controllers/planController.js";

const planRouter = express.Router();
planRouter.use(protect);

// ── Coach: Workout Plans ──
planRouter.get("/workout", restrictTo("coach"), getMyWorkoutPlans);
planRouter.post("/workout", restrictTo("coach"), createWorkoutPlan);
planRouter.get("/workout/:planId", restrictTo("coach"), getWorkoutPlanById);
planRouter.patch("/workout/:planId", restrictTo("coach"), updateWorkoutPlan);
planRouter.delete("/workout/:planId", restrictTo("coach"), deleteWorkoutPlan);

// ── Coach: Nutrition Plans ──
planRouter.get("/nutrition", restrictTo("coach"), getMyNutritionPlans);
planRouter.post("/nutrition", restrictTo("coach"), createNutritionPlan);
planRouter.get("/nutrition/:planId", restrictTo("coach"), getNutritionPlanById);
planRouter.patch("/nutrition/:planId", restrictTo("coach"), updateNutritionPlan);
planRouter.delete("/nutrition/:planId", restrictTo("coach"), deleteNutritionPlan);

// ── Coach: Assignments ──
planRouter.post("/assign", restrictTo("coach"), assignPlan);
planRouter.patch("/assign/:assignmentId", restrictTo("coach"), updateAssignmentStatus);
planRouter.get("/coach/members/:memberId/plans", restrictTo("coach"), getCoachMemberPlans);

// ── Member: View own plans ──
planRouter.get("/my-plans", getMyActivePlans);
planRouter.get("/my-plans/history", getMyPlanHistory);

export default planRouter;