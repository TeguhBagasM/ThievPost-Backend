import express from "express";
import { Login, logOut, Me, signUp } from "../controllers/AuthController.js";

const router = express.Router();

router.get("/me", Me);
router.post("/login", Login);
router.post("/signup", signUp);
router.delete("/logout", logOut);

export default router;
