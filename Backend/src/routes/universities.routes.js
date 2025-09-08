import { Router } from "express";
import { getUniversities, createUniversity, searchUniversities } from "../controllers/universities.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/universities", getUniversities);
router.post("/universities", authenticateToken, createUniversity);
router.get("/universities/search", searchUniversities);


export default router;
