// FILE: src/routes/planRoutes.ts
// Replace your existing planRoutes completely with this code

import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
    // Workout Plans
    createWorkoutPlan,
    getMyWorkoutPlans,
    getWorkoutPlanById,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    // Nutrition Plans
    createNutritionPlan,
    getMyNutritionPlans,
    getNutritionPlanById,
    updateNutritionPlan,
    deleteNutritionPlan,
    // Assignments
    assignPlan,
    updateAssignmentStatus,
    getCoachMemberPlans,
    // Member
    getMyActivePlans,
    getMyPlanHistory
} from "../controllers/planController.js";

const planRouter = express.Router();

// All routes require authentication
planRouter.use(protect);

// Get all my workout plans
planRouter.get(
    "/workout",
    restrictTo("coach"),
    getMyWorkoutPlans
);

// Create new workout plan
planRouter.post(
    "/workout",
    restrictTo("coach"),
    createWorkoutPlan
);

// Get single workout plan
planRouter.get(
    "/workout/:planId",
    restrictTo("coach"),
    getWorkoutPlanById
);

// Update workout plan
planRouter.patch(
    "/workout/:planId",
    restrictTo("coach"),
    updateWorkoutPlan
);

// Delete workout plan
planRouter.delete(
    "/workout/:planId",
    restrictTo("coach"),
    deleteWorkoutPlan
);



// Get all my nutrition plans
planRouter.get(
    "/nutrition",
    restrictTo("coach"),
    getMyNutritionPlans
);

// Create new nutrition plan
planRouter.post(
    "/nutrition",
    restrictTo("coach"),
    createNutritionPlan
);

// Get single nutrition plan
planRouter.get(
    "/nutrition/:planId",
    restrictTo("coach"),
    getNutritionPlanById
);

// Update nutrition plan
planRouter.patch(
    "/nutrition/:planId",
    restrictTo("coach"),
    updateNutritionPlan
);

// Delete nutrition plan
planRouter.delete(
    "/nutrition/:planId",
    restrictTo("coach"),
    deleteNutritionPlan
);


// Assign plan to member
planRouter.post(
    "/assign",
    restrictTo("coach"),
    assignPlan
);

// Update assignment status
planRouter.patch(
    "/assign/:assignmentId",
    restrictTo("coach"),
    updateAssignmentStatus
);

// Get member's plans
planRouter.get(
    "/coach/members/:memberId/plans",
    restrictTo("coach"),
    getCoachMemberPlans
);


// Get my active plans
planRouter.get(
    "/my-plans",
    getMyActivePlans
);

// Get my plan history
planRouter.get(
    "/my-plans/history",
    getMyPlanHistory
);

export default planRouter;