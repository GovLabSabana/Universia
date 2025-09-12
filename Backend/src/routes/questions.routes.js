import express from "express";
import { getQuestionsByDimension, getQuestion } from "../controllers/questions.controller.js";

const router = express.Router();

router.get("/dimensions/:dimensionId/questions", getQuestionsByDimension);
router.get("/questions/:id", getQuestion);

export default router;