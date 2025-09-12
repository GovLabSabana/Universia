import express from "express";
import { getDimensions, getDimension } from "../controllers/dimensions.controller.js";

const router = express.Router();

router.get("/dimensions", getDimensions);
router.get("/dimensions/:id", getDimension);

export default router;