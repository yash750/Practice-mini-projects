import { Router } from "express";
import {addFileToQueue, chat} from "../controllers/pdf.controller.js";
import upload from './middlewares/multer.middleware.js';

const router = Router();

router.post("/upload", upload.single("file"), addFileToQueue);
router.post("/chat", chat);

export default router;
