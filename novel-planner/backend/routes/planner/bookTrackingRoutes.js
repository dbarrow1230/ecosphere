import express from "express";
import {
 createBookDeadline,
 createBookGoal,
 createBookSession,
 getBookDeadlines,
 getBookGoals,
 getBookSessions,
 updateBookDeadline,
 updateBookGoal,
 updateBookSession
} from "../../controllers/planner/bookTrackingController.js";

export const bookGoalRoutes=express.Router()
 .get("/",getBookGoals)
 .post("/",createBookGoal)
 .put("/:id",updateBookGoal);

export const bookDeadlineRoutes=express.Router()
 .get("/",getBookDeadlines)
 .post("/",createBookDeadline)
 .put("/:id",updateBookDeadline);

export const bookSessionRoutes=express.Router()
 .get("/",getBookSessions)
 .post("/",createBookSession)
 .put("/:id",updateBookSession);
