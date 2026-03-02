import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
    addProgress,
    getMyProgress,
    getProgressComparison,
    getAssignedMembersProgress,
    addProgressNotes,
    getCoachMembersList,
    getCoachMemberDetail,
    addCoachFeedback,
    getProgressChartData,
    getFitnessSummary,
    getCoachMemberChartData
} from "../controllers/progressController.js"

const progressRouter = express.Router();

// Protect all routes
progressRouter.use(protect);

// Member routes
progressRouter.post("/add", addProgress);
progressRouter.get("/my-progress", getMyProgress);
progressRouter.get("/comparison", getProgressComparison);

// Coach routes
progressRouter.get(
    "/coach/members-progress",
    restrictTo("coach"),
    getAssignedMembersProgress
);
progressRouter.patch(
    "/coach/add-notes",
    restrictTo("coach"),
    addProgressNotes
);
progressRouter.get(
    "/coach/members",
    restrictTo("coach"),
    getCoachMembersList
);

progressRouter.get(
    "/coach/members/:memberId",
    restrictTo("coach"),
    getCoachMemberDetail
);

progressRouter.patch(
    "/coach/members/feedback",
    restrictTo("coach"),
    addCoachFeedback
);

progressRouter.get("/chart-data", getProgressChartData);
progressRouter.get("/summary", getFitnessSummary);

// Coach chart data for a member
progressRouter.get(
    "/coach/members/:memberId/chart",
    restrictTo("coach"),
    getCoachMemberChartData
);



export default progressRouter;