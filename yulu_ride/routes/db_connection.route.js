import { Router } from "express";
import queryService from "../controllers/queryService.controller.js";

const router = Router();

router.post("/query", queryService);

export default router;