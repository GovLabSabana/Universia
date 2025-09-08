import { Router } from "express";
import { createScore, getScoresByUniversity } from "../controllers/scores.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/scores", authenticateToken, createScore);
router.get("/universities/:id/scores", getScoresByUniversity);

export default router;
