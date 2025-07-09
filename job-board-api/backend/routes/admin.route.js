import Router from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { getUsers } from "../controllers/admin.controller.js"; 

const router = Router();

router.get("/getusers", authenticate, authorize("admin"), getUsers);

export default router;