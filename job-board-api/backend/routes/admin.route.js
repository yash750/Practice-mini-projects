import Router from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { getUsers, listAllJobs} from "../controllers/admin.controller.js"; 


const router = Router();

router.get("/getusers", authenticate, authorize("admin"), getUsers);
router.get("/getJobs", authenticate, authorize("admin"), listAllJobs);


export default router;