import { Router } from "express";
import { addJob, getJobs, getJob, updateJob, deleteJob } from "../controllers/jobs.controller.js";
import {authenticate, authorize} from "../middlewares/auth.middleware.js";


const router = Router();

router.get("/getjobs",authenticate, getJobs);
router.get("/getjob/:id",authenticate, getJob);
router.post("/addjob",authenticate, authorize("employer"), addJob);
router.post("/updatejob/:id",authenticate, authorize("employer"), updateJob);
router.post("/deletejob/:id",authenticate, authorize("employer"), deleteJob);

export default router;
