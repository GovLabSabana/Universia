import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { 
  getEvaluations, 
  getEvaluation, 
  createOrUpdateEvaluation, 
  deleteEvaluation,
  getGlobalAverages,
  getUniversitiesRanking
} from "../controllers/evaluations.controller.js";

const router = express.Router();

router.get("/evaluations", authenticateToken, getEvaluations);
router.get("/evaluations/averages", authenticateToken, getGlobalAverages);
router.get("/evaluations/ranking", authenticateToken, getUniversitiesRanking);
router.get("/evaluations/:id", authenticateToken, getEvaluation);
router.post("/evaluations", authenticateToken, createOrUpdateEvaluation);
router.delete("/evaluations/:id", authenticateToken, deleteEvaluation);

export default router;