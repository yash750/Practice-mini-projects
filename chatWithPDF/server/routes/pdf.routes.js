import { Router } from "express";
import {addFileToQueue, chat, getUserFiles, deleteFile, getFileStatus} from "../controllers/pdf.controller.js";
import upload from '../middlewares/multer.middleware.js';
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = Router();

router.post("/upload", upload.single("file"), isLoggedIn, addFileToQueue);
router.post("/chat", isLoggedIn, chat);
router.get("/files", isLoggedIn, getUserFiles);
router.get("/files/:fileId/status", isLoggedIn, getFileStatus);
router.delete("/files/:fileId", isLoggedIn, deleteFile);

export default router;
