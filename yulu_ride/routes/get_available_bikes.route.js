import { Router } from "express";
import { healthCheck, get_available_bikes } from "../controllers/get_available_bikes.controller.js";


const router = Router();

router.get("/health", healthCheck)
router.post("/get_available_bikes", get_available_bikes);

export default router;