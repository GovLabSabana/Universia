import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { 
  getEvaluations, 
  getEvaluation, 
  createOrUpdateEvaluation, 
  submitEvaluation, 
  deleteEvaluation 
} from "../controllers/evaluations.controller.js";

const router = express.Router();

router.get("/evaluations", authenticateToken, getEvaluations);
router.get("/evaluations/:id", authenticateToken, getEvaluation);
router.post("/evaluations", authenticateToken, createOrUpdateEvaluation);
router.put("/evaluations/:id/submit", authenticateToken, submitEvaluation);
router.delete("/evaluations/:id", authenticateToken, deleteEvaluation);

export default router;