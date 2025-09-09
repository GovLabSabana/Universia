import { supabase } from "../config/supabase.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const createScore = async (req, res) => {
  try {
    const { university_id, criterion_id, score, comment } = req.body;

    if (!university_id || !criterion_id || !score) {
      return sendError(res, "VALIDATION_ERROR", "university_id, criterion_id and score are required", 400);
    }

    if (score < 1 || score > 5) {
      return sendError(res, "VALIDATION_ERROR", "Score must be between 1 and 5", 400);
    }

    const { data, error } = await supabase
      .from("scores")
      .insert({
        university_id,
        criterion_id,
        score,
        comment,
        evaluated_by: req.user?.id || null
      })
      .select()
      .single();

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Score added successfully", 201);
  } catch (err) {
    console.error("Error creating score:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};
/**
 * @swagger
 * /scores:
 *   post:
 *     tags:
 *       - Scores
 *     summary: Add a score for a university
 *     description: Create a new evaluation score for a university and a criterion.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - university_id
 *               - criterion_id
 *               - score
 *             properties:
 *               university_id:
 *                 type: integer
 *                 example: 1
 *               criterion_id:
 *                 type: integer
 *                 example: 2
 *               score:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Excelente cumplimiento en sostenibilidad"
 *     responses:
 *       201:
 *         description: Score added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error (missing fields or invalid score)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export const getScoresByUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("scores")
      .select("*, criteria(name, dimension)")
      .eq("university_id", id);

    if (error) {
      return sendError(res, "DB_ERROR", error.message);
    }

    sendSuccess(res, data, "Scores retrieved successfully");
  } catch (err) {
    console.error("Error fetching scores:", err);
    sendError(res, "INTERNAL_ERROR", "Internal server error");
  }
};
/**
 * @swagger
 * /universities/{id}/scores:
 *   get:
 *     tags:
 *       - Scores
 *     summary: Get all scores for a specific university
 *     description: Retrieve all evaluation scores for a given university, including criterion details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the university
 *     responses:
 *       200:
 *         description: List of scores for the university
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
 *                   example: Scores retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       university_id:
 *                         type: integer
 *                       criterion_id:
 *                         type: integer
 *                       score:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       criteria:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           dimension:
 *                             type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
