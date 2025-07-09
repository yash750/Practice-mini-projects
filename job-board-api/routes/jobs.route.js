import { Router } from "express";
import { addJob, getJobs } from "../controllers/jobs.controller.js";
import {authenticate, authorize} from "../middlewares/auth.middleware.js";


const router = Router();

router.get("/getjobs",authenticate, getJobs);
router.post("/addjob",authenticate, authorize("employer"), addJob);

export default router;
