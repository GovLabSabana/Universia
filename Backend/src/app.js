import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import authRoutes from "./routes/auth.routes.js";
import { sendError, sendSuccess } from "./utils/response.js";
import universitiesRoutes from "./routes/universities.routes.js";
import dimensionsRoutes from "./routes/dimensions.routes.js";
import questionsRoutes from "./routes/questions.routes.js";
import evaluationsRoutes from "./routes/evaluations.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let swaggerDocument;

try {
  const swaggerData = readFileSync("./swagger-output.json", "utf8");
  console.log("Swagger documentation loaded successfully.");
  swaggerDocument = JSON.parse(swaggerData);
} catch (error) {
  console.warn(
    "⚠️  Swagger documentation not found. Run: npm run docs:generate"
  );
}
const allowedOrigins = process.env.FRONTEND_URL.split(",").map((url) =>
  url.trim()
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: API Health Check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Express Supabase Auth API
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     description:
 *                       type: string
 *                       example: Authentication API with Supabase integration
 */
app.get("/", (req, res) => {
  sendSuccess(
    res,
    {
      name: "University Evaluation API",
      version: "1.0.0",
      description:
        "University evaluation system with 3 dimensions: Governance, Social, Environmental",
    },
    "API is running successfully"
  );
});

app.use("/auth", authRoutes);
app.use("/", universitiesRoutes);
app.use("/", dimensionsRoutes);
app.use("/", questionsRoutes);
app.use("/", evaluationsRoutes);

if (swaggerDocument) {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Universia Evaluation API Docs",
    })
  );
}

app.use("*", (req, res) => {
  sendError(res, "NOT_FOUND", `Route ${req.originalUrl} not found`, 404);
});

app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error.type === "entity.parse.failed") {
    return sendError(res, "INVALID_JSON", "Invalid JSON format", 400);
  }

  sendError(res, "INTERNAL_ERROR", "Internal server error");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}`);
  console.log(`📖 Swagger docs available at http://localhost:${PORT}/docs`);
});
