import { Router } from "express";
import {viewMyApplications, applyForJob, getJobApplications, updateApplication } from "../controllers/applications.controller.js";
import {authenticate, authorize} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/viewmyapplications",authenticate, viewMyApplications);
router.post("/applyforjob/:id",authenticate, applyForJob);
router.get("/getjobapplications/:id",authenticate, authorize("employer"), getJobApplications);
router.put("/updateapplication/:id",authenticate, authorize("employer"), updateApplication);

export default router;  