import { Router } from "express";
import {videoUpload} from "../controllers/video.controller.js";
import upload from '../middlewares/multer.middleware.js';
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = Router();

router.post("/upload", upload.single("file"), isLoggedIn, videoUpload);

export default router;

