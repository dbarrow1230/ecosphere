// backend/routes/recipes/CourseRoutes.js
import express from "express";
import {createCourse,getCourses,getCourseById,updateCourse,deleteCourse} from "../../controllers/recipes/CourseController.js";

const router=express.Router();

router.post("/",createCourse);
router.get("/",getCourses);
router.get("/:id",getCourseById);
router.put("/:id",updateCourse);
router.delete("/:id",deleteCourse);

export default router;