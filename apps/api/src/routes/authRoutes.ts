import { Router } from "express";
import { loginHandler, registerHandler, meHandler, saveCredentialsHandler } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// * Public
router.post("/register", registerHandler);
router.post("/login", loginHandler);

// * Protected (authMiddleware applied inline since /auth is public-mounted)
router.get("/me", authMiddleware, meHandler);
router.put("/credentials", authMiddleware, saveCredentialsHandler);

export default router;
