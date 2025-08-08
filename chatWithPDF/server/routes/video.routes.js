import { Router } from "express";
import {videoUpload} from "../controllers/video.controller"

const router = Router();

router.post("/upload", videoUpload);

export default router;

