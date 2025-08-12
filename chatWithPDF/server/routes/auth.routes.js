import { Router } from "express";
import { login, register, verify, logout, getProfile} from "../controllers/auth.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify/:token", verify);
router.post("/logout", isLoggedIn, logout);
router.get("/profile", isLoggedIn, getProfile);

export default router;