import { Router } from "express";
import { getCriteria } from "../controllers/criteria.controller.js";

const router = Router();

router.get("/criteria", getCriteria);

export default router;
